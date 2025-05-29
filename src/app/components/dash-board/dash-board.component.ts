import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { TaskService, TaskStatusCounts } from 'src/app/services/task.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { BaseChartDirective } from 'ng2-charts';


@Component({
  selector: 'app-dash-board',
  templateUrl: './dash-board.component.html',
  styleUrls: ['./dash-board.component.scss']
})
export class DashBoardComponent implements OnInit {
  
@ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  totalTask: number = 0;

  public doughnutChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Completed', 'Pending', 'WIP', 'Rescheduled'],
    datasets: [
      {
        data: [0, 0, 0, 0],
        backgroundColor: ['#4caf50', '#ff9800', '#2196f3', '#9c27b0'],
        hoverOffset: 10
      }
    ]
  };

  displayedColumns: string[] = ['taskId', 'customerName', 'gender', 'mobileNumber', 'whatsappNumber', 'email', 'preferredLanguage', 'preferredTime', 'status'];
  tasks: any[] = [];
  hoveredRow: any = null;

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName);
  }

  constructor(private dialog: MatDialog, private taskService: TaskService) { }

  ngOnInit() {
    this.loadChartData();
    this.loadTasks();

  }

  /* load the existing tasks*/
  loadTasks(): void {
    const storedTasks = localStorage.getItem('tasks');
    this.tasks = storedTasks ? JSON.parse(storedTasks) : [];
    this.dataSource.data = this.tasks;
    this.totalTask = this.dataSource.data.length;

    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const dataStr = Object.values(data).join(' ').toLowerCase();
      return dataStr.includes(filter.trim().toLowerCase());
    };
  }

  loadChartData() {
    const counts: TaskStatusCounts = this.taskService.getTaskStatusCounts();
    const completedCount = this.tasks.filter(t => t.status === 'Completed').length;
  const pendingCount = this.tasks.filter(t => t.status === 'Pending').length;
  const wipCount = this.tasks.filter(t => t.status === 'WIP').length;
  const rescheduledCount = this.tasks.filter(t => t.status === 'Rescheduled').length;

    this.doughnutChartData.datasets[0].data = [
      counts.completed,
      counts.pending,
      counts.wip,
      counts.rescheduled
    ];
    if (this.chart) {
    this.chart.update();
  }

  }

  /**Apply filter base on search val 
   * 
  */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    const filteredTasks = this.taskService.filterTasks(filterValue);
    this.dataSource.data = filteredTasks;
  }

  /**
   * Open the add task dailog for create new task
   */
  addTask() {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      height: '600px',
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tasks.push(result);
        localStorage.setItem('tasks', JSON.stringify(this.tasks)); // Save to localStorage
        this.dataSource.data = this.tasks;
        this.loadChartData();
      }
    });
  }


  /**
   * edit dailog open for editing the existing task
   */
  editTask(task: any): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      height: '600px',
      width: '600px',
      data: task
    });



    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

        const index = tasks.findIndex((t: any) => t.taskId === result.taskId);
        if (index > -1) {
          this.taskService.editTask(result);
          this.loadTasks();
          this.loadChartData();
        }
      }
    });
  }

  /**
   * export the task in excel format
   */
  exportToExcel(): void {
    const dataToExport = this.dataSource.filteredData.length
      ? this.dataSource.filteredData
      : this.dataSource.data;

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Tasks': worksheet },
      SheetNames: ['Tasks']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const fileName = 'task-list.xlsx';
    this.saveAsExcelFile(excelBuffer, fileName);


  }

  /**
   * format the time 
   */
  formatTime(time: string): string {
    if (!time) return '';
    const [hoursStr, minutes] = time.split(':');
    let hours = +hoursStr;

    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    const formattedHours = hours < 10 ? '0' + hours : hours;
    return `${formattedHours}.${minutes} ${period} IST`;
  }

  /**
   * format the email
   */
  maskEmail(email: string): string {
    if (!email) return '';

    const [username, domain] = email.split('@');
    if (!domain || username.length <= 3) return email;

    const visible = username.slice(0, 3);
    const masked = '*'.repeat(username.length - 3);

    return `${visible}${masked}@${domain}`;
  }

  /**
   * update the status color by value
   */
  getStatusStyle(status: string): { [key: string]: string } {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { color: 'green', 'font-weight': 'bold' };
      case 'pending':
        return { color: 'red', 'font-weight': 'bold' };
      case 'wip':
        return { color: 'orange', 'font-weight': 'bold' };
      case 'rescheduled':
        return { color: 'blue', 'font-weight': 'bold' };
      default:
        return {};
    }
  }

  onMouseEnter(row: any) {
    this.hoveredRow = row;
  }

  onMouseLeave(row: any) {
    this.hoveredRow = null;
  }
}
