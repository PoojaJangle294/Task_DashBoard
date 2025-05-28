import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA,MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-task-dialog',
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.scss']
})
export class TaskDialogComponent implements OnInit{
 addtaskForm: FormGroup;

  languages = ['English', 'Hindi', 'Marathi', 'Tamil'];
  statuses = ['Completed', 'Pending', 'WIP', 'Rescheduled'];

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TaskDialogComponent>,
    private taskService: TaskService
  ) {
    this.addtaskForm = this.fb.group({
      taskId: [''], 
      customerName: [this.data?.customerName || '', Validators.required],
      gender: [this.data?.gender ||'male', Validators.required],
      mobileNumber: [this.data?.mobile ||'', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      whatsappNumber:[this.data?.whatsappNumber ||'', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      email: [this.data?.email ||'', [Validators.required, Validators.email]],
      preferredLanguage: [this.data?.preferredLanguage||'', Validators.required],
      preferredTime: [this.data?.preferredTime ||'',Validators.required ],
      status: [this.data?.status || '', Validators.required]
    });
  }
  ngOnInit() {
    if (this.data) {
  this.addtaskForm.patchValue(this.data);
}
  }

  onSubmit(): void {
    if (this.addtaskForm.valid) {
      const formValue = this.addtaskForm.value;

      if (formValue.taskId) {
        // EDIT MODE: update the task
        this.taskService.editTask(formValue);
      } else {
        // CREATE MODE: add a new task
        formValue.taskId = this.taskService.generateTaskId();
        this.taskService.addNewTask(formValue);
      }

      this.dialogRef.close(formValue);
    }
  }

  

  onCancel() {
    this.dialogRef.close();
  }
}
