import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


export interface Task {
  taskId: string;
  customerName: string;
  gender: string;
  mobileNumber: string;
  email: string;
  preferredLanguage: string;
  preferredTime: string;
  status: string;
}

export interface TaskStatusCounts {
  completed: number;
  pending: number;
  wip: number;
  rescheduled: number;
}
@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor() { }


  /**
   * fetch the all task from local storage
   */
  getTasks(): Task[] {
    return JSON.parse(localStorage.getItem('tasks') || '[]');
  }

  /**
   * set the task 
   */
  saveTasks(tasks: Task[]): void {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  /**
   * Add new task
   */

  addNewTask(newTask: Task): void {
    const tasks = this.getTasks();
    tasks.push(newTask);
    this.saveTasks(tasks);
  }

  /** 
   * Edit an existing task
   * */
  editTask(updatedTask: Task): void {
    const tasks = this.getTasks();
    const index = tasks.findIndex((task) => task.taskId === updatedTask.taskId);
    if (index !== -1) {
      tasks[index] = updatedTask;
      this.saveTasks(tasks);
    }
  }

  /**
   * get the task status like WIP , Completing
   */
  getTaskStatusCounts() {
    const tasks = this.getTasks();

    const counts: TaskStatusCounts = {
      completed: 0,
      pending: 0,
      wip: 0,
      rescheduled: 0,
    };

    tasks.forEach((task: Task) => {
      const status = task.status?.toLowerCase();
      if (status && status in counts) {
        counts[status as keyof TaskStatusCounts]++;
      }
    });

    return counts;
  }

  /**
   * Get the task status count
   */
  getTaskCount(){
    const tasks = this.getTasks();
    const statuscount = tasks.map((sat)=>{console.log(sat.status)});
    return statuscount
  }

  /**
   * Filter the data by search input
   */
  filterTasks(filter: string): Task[] {
    const tasks = this.getTasks();
    return tasks.filter((task) => {
      const dataStr = Object.values(task).join(' ').toLowerCase();
      return dataStr.includes(filter.trim().toLowerCase());
    });
  }

  /**
   * generate the task ID 
   */
  generateTaskId(): string {
    return 'T' + Math.floor(100 + Math.random() * 900);
  }

}
