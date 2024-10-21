import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ListService } from '../../core/service/list-service/list.service';
import { TaskService } from '../../core/service/task-service/task.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  lists: any[] = [];
  tasks: any[] = [];
  submitted = false;
  showNoTasksMessage = false;
  showForm = false; // save list form
  private unsubscribe$ = new Subject<void>(); // For unsubscription
  activeListId: string | null = null;
  isEditList = false; // edit list form
  isEditTask = false; // edit task form
  openEditTaskId: string | null = null; // Task ID for editing

  showTaskForm: boolean = false; // save task form

  constructor(private listService: ListService, private taskService: TaskService) { }

  ngOnInit(): void {
    // Fetch lists when the component initializes
    this.fetchLists();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  createTaskForm = new FormGroup({
    taskTopic: new FormControl('', [Validators.required]),
  });

  get taskTopic() {
    return this.createTaskForm.get('taskTopic');
  }

  createListForm = new FormGroup({
    topic: new FormControl('', [Validators.required]),
  });

  get topic() {
    return this.createListForm.get('topic');
  }

  // Close dropdown when clicking outside of it
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.isDropdownOpen = false;
  }

  isDropdownOpen = false; // Boolean flag to toggle dropdown

  // Toggle dropdown visibility when clicking the ellipsis icon
  toggleDropdown(listId: string, event: MouseEvent) {
    event.stopPropagation(); // Prevent click from bubbling up to document

    // If clicking on the same list, toggle the dropdown
    if (this.activeListId === listId) {
      this.isDropdownOpen = !this.isDropdownOpen;
    } else {
      // Otherwise, open the dropdown for the clicked list
      this.activeListId = listId;
      this.isDropdownOpen = true;
    }
  }

  // Handle creating a new task
  onCreateTask() {
    this.submitted = true;

    if (this.createTaskForm.valid) {
      const topicValue: string = this.taskTopic?.value || '';
      console.log('Topic Value:', topicValue);
      console.log('Active List ID:', this.activeListId);
      this.taskService.createTask(this.activeListId || '', topicValue, 'normal').pipe(takeUntil(this.unsubscribe$)).subscribe({
        next: (response) => {
          console.log('New Task Created:', response);

          // SweetAlert for successful creation
          Swal.fire({
            title: 'Success!',
            text: 'Task created successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });

          this.createTaskForm.reset();
          this.showTaskForm = false;
          this.submitted = false;
          this.fetchLists();
        },
        error: (error) => {
          console.error('Error creating list:', error);

          // SweetAlert for error notification
          Swal.fire({
            title: 'Error!',
            text: 'Failed to create list. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      });

    } else {
      console.log('Form is invalid');

      // Optional: SweetAlert for invalid form
      Swal.fire({
        title: 'Warning!',
        text: 'Please fill in the form correctly.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  }

  // Handle updating a task
  onEditTask(taskId: string | null) {
    this.submitted = true;
  
    if (this.createTaskForm.valid && taskId) {
      const topicValue: string = this.taskTopic?.value || '';
  
      // Call the updateTask method of the TaskService
      this.taskService.updateTask(taskId, topicValue, 'normal', false).pipe(takeUntil(this.unsubscribe$)).subscribe({
        next: (response) => {
          console.log('Task Updated:', response);
  
          // SweetAlert for successful update
          Swal.fire({
            title: 'Success!',
            text: 'Task updated successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });
  
          // Reset the form and set isEditTask to false
          this.createTaskForm.reset(); // Clears the form fields
          this.isEditTask = false;     // Closes the edit form
          this.showTaskForm = false;   // Hides the task form
  
          // Refresh the task list after task update
          if (this.activeListId) {
            this.getTasksByListId(this.activeListId);
          }
        },
        error: (error) => {
          console.error('Error updating task:', error);
  
          // SweetAlert for error
          Swal.fire({
            title: 'Error!',
            text: 'Failed to update task. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      });
    } else {
      console.log('Form is invalid');
  
      // SweetAlert for invalid form
      Swal.fire({
        title: 'Warning!',
        text: 'Please fill in the form correctly.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  }

  // Handle creating a new list
  onCreateList() {
    this.submitted = true;

    if (this.createListForm.valid) {
      const topicValue: string = this.topic?.value || '';

      this.listService.newList(topicValue).pipe(takeUntil(this.unsubscribe$)).subscribe({
        next: (response) => {
          console.log('New List Created:', response);

          // SweetAlert for successful creation
          Swal.fire({
            title: 'Success!',
            text: 'List created successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });

          this.createListForm.reset();
          this.showForm = false;
          this.submitted = false;
          this.fetchLists();
        },
        error: (error) => {
          console.error('Error creating list:', error);

          // SweetAlert for error notification
          Swal.fire({
            title: 'Error!',
            text: 'Failed to create list. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      });

    } else {
      console.log('Form is invalid');

      // Optional: SweetAlert for invalid form
      Swal.fire({
        title: 'Warning!',
        text: 'Please fill in the form correctly.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  }

  // Handle editing the list
  onEditList(lisId: any) {
    this.isEditList = false;
    this.submitted = false;

    if (this.createListForm.valid) {
      const topicValue: string = this.topic?.value || '';

      this.listService.updateList(lisId, topicValue).pipe(takeUntil(this.unsubscribe$)).subscribe({
        next: (response) => {
          console.log('List Updated:', response);

          // SweetAlert for successful update
          Swal.fire({
            title: 'Success!',
            text: 'List updated successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });

          this.createListForm.reset();
          this.showForm = false;
          this.fetchLists();
        },
        error: (error) => {
          console.error('Error updating list:', error);

          // SweetAlert for error notification
          Swal.fire({
            title: 'Error!',
            text: 'Failed to update list. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      });

    } else {
      console.log('Form is invalid');

      // Optional: SweetAlert for invalid form
      Swal.fire({
        title: 'Warning!',
        text: 'Please fill in the form correctly.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  }
  
  fetchLists(): void {
    this.listService.getLists().subscribe({
      next: (response: any) => {
        console.log('Fetched lists:', response.lists);

        // Ensure lists is an array
        this.lists = Array.isArray(response.lists) ? response.lists : [];

        if (this.lists.length > 0) {
          // Set the first list as the active list
          this.activeListId = this.lists[0]._id;
          if (this.activeListId) {
            this.getTasksByListId(this.activeListId);
          }
        } else {
          this.tasks = [];
          this.showNoTasksMessage = true; // Show no tasks message if no lists
        }
      },
      error: (error) => {
        console.error('Error fetching lists:', error);
        this.lists = [];
        this.showNoTasksMessage = true; // Show no tasks message if error occurs
      }
    });
  }

  // Handle editing the list
  editList(listId: string) {
    console.log(`Editing list ${listId}`);
    this.isDropdownOpen = false; // Close the dropdown
    this.isEditList = true; // Set the flag to show the edit form
    // this.onEditList(listId);
  }

  // Handle deleting the list with SweetAlert
  deleteList(listId: string) {
    // Show a confirmation dialog
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        // If the user confirms, call the deleteList service method
        this.listService.deleteList(listId).subscribe({
          next: (response) => {
            console.log(`List ${listId} deleted successfully.`);
            Swal.fire(
              'Deleted!',
              'Your list has been deleted.',
              'success'
            );
            this.fetchLists(); // Refresh the list of lists after deletion
          },
          error: (error) => {
            console.error('Error deleting list:', error);
            Swal.fire(
              'Error!',
              'There was a problem deleting the list.',
              'error'
            );
          }
        });
      }
    });
  }

  openAddTaskForm() {
    this.showTaskForm = true;
  }

  // create list form action
  toggleForm() {
    this.showForm = !this.showForm;
    this.submitted = false;
  }

  onCancel() {
    this.createListForm.reset();
    this.showForm = false;
    this.isEditList = false;
    this.showTaskForm = false;
    this.isEditTask = false;
    this.submitted = false;
  }

  onListClick(listId: string) {
    console.log('Selected List ID:', listId); // Log the selected list ID
    if (!listId) {
      console.error('List ID is undefined or invalid.');
      return; // Exit if the listId is invalid
    }
    // Set the selected list as active and fetch its tasks
    this.activeListId = listId;
    this.getTasksByListId(listId);
  }

  // Fetch tasks by list ID
  getTasksByListId(listId: string) {
    this.taskService.getTasksByListId(listId).subscribe({
      next: (response: any) => {
        console.log('Fetched tasks:', response.tasks);

        // Ensure response.tasks is defined and is an array, fallback to []
        this.tasks = Array.isArray(response.tasks) ? response.tasks : [];

        // Update flag based on tasks length
        this.showNoTasksMessage = this.tasks.length === 0;
      },
      error: (error) => {
        console.error('Error fetching tasks:', error);

        // Reset tasks in case of error
        this.tasks = [];

        // Show no tasks message if error occurs
        this.showNoTasksMessage = true;
      }
    });
  }


  editTask(taskId: string) {
    this.isEditTask = true;  // Set edit mode
    this.openEditTaskId = taskId; // Store the task ID
    const selectedTask = this.tasks.find(task => task._id === taskId);
    if (selectedTask) {
      this.createTaskForm.patchValue({
        taskTopic: selectedTask.topic,
      });
      // Open the form or UI section for editing.
      this.showTaskForm = true;
    } else {
      console.error('Task not found');
    }
  }
  

deleteTask(taskId: string) {
  // Call your service to delete the task from the backend
  this.taskService.deleteTask(taskId).subscribe(
    () => {
      // On successful deletion, filter out the deleted task from the tasks array
      this.tasks = this.tasks.filter(task => task._id !== taskId);

      // Optionally, you can set showNoTasksMessage to true if tasks array is empty
      this.showNoTasksMessage = this.tasks.length === 0;
    },
    error => {
      console.error('Error deleting task:', error);
      // Handle error here, e.g., show a message to the user
    }
  );
}



}
