// style
import './style.css';

// Authentication

import signin from './modules/loginApi';
import signup from './modules/signupApi';

// crud operation on task

import createTask  from './modules/createTaskApi';
import getTasks from './modules/getTasksApi';
import editTask from './modules/editTaskApi';
import deleteTask from './modules/deleteTaskApi';

// Get user info

import getUserInfo from './modules/userApi';

// Define the UserData interface

interface UserData {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    role: string;
    groupId: string;
}

interface LoginData {
    email: string;
    password: string;
}

interface CreateTask {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    groupId: string;
}

// Add event listeners after the DOM is fully loaded

window.addEventListener('DOMContentLoaded', async () => {
    
    // Form values

    const firstname = document.getElementById('firstname') as HTMLInputElement | null;
    const lastname = document.getElementById('lastname') as HTMLInputElement | null;
    const email = document.getElementById('email') as HTMLInputElement | null;
    const password = document.getElementById('password') as HTMLInputElement | null;
    const selectedCategory = document.getElementById('taskCategory') as HTMLInputElement | null;

    let message = document.getElementById('message') as HTMLDivElement || null;
     
    // 1, signup authentication

    const signupForm = document.getElementById('signup-form');
    signupForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        console.log('Selected Category:', selectedCategory);

        function updateMessage(element: HTMLElement, type: 'success' | 'warning' | 'danger', text: string) {
            element.classList.remove('alert-light', 'alert-success', 'alert-warning', 'alert-danger');
            element.classList.add(`alert-${type}`);
            element.innerHTML = text;
        }

        const userData: UserData = {
            firstname: firstname?.value || '',
            lastname: lastname?.value || '',
            email: email?.value || '',
            password: password?.value || '',
            role: 'user',
            groupId: selectedCategory?.value || '',
        };
        
        signup(userData).then((response) => {
            message.style.visibility = 'visible';
            if (response.ok) {
                updateMessage(message!, 'success', 'User created successfully');
                console.log('User created successfully');
                setTimeout(() => {
                    window.location.href = '/signin';   // redirect to login page
                }, 3000);
            } else if (response.status === 403) {
                updateMessage(message!, 'warning', 'User already exists');
                console.log('User already exists');
            } else {
                updateMessage(message!, 'danger', 'An error occurred');
                console.log('An error occurred');
            }
        }).catch(error => {
            updateMessage(message!, 'danger', 'An error occurred');
            console.error('Error:', error);
        });
    });


    // 2, login authentication

    const loginForm = document.getElementById('login-form');
    loginForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        function updateMessage(element: HTMLElement, type: 'success' | 'warning' | 'danger', text: string) {
            element.classList.remove('alert-light', 'alert-success', 'alert-warning', 'alert-danger');
            element.classList.add(`alert-${type}`);
            element.innerHTML = text;
        }

        const loginData: LoginData = {
            email: email?.value || '',
            password: password?.value || '',
        };
        
        signin(loginData).then((response) => {
            message.style.visibility = 'visible';
            if (response.ok) {
                response.json().then((data: { access_token: string | null; user: object}) => {
                    accessToken = data.access_token;   // get the access token
                    if (accessToken) {
                        // save access token in local storage
                        localStorage.setItem('accessToken', accessToken); // Store the access token
                        updateMessage(message!, 'success', 'User logged in successfully');
                        if(data.user.role == 'manager'){
                            setTimeout(() => {
                                window.location.href = '../AdminDashboard';
                            }, 3000); // Redirect after 3 seconds
                        }else{
                            setTimeout(() => {
                                window.location.href = '../UserDashboard';
                            }, 3000); 
                        }
                    } else {
                        updateMessage(message!, 'danger', 'Failed to retrieve access token.');
                        console.error('Failed to retrieve access token.');
                    }
                });
            } else if (response.status === 403) {
                updateMessage(message!, 'warning', 'Invalid credentials. Please try again');
                console.log('Invalid credentials. Please try again');
            } else {
                updateMessage(message!, 'danger', 'An error occurred');
                console.log('An error occurred');
            }
        }).catch(error => {
            updateMessage(message!, 'danger', 'An error occurred');
            console.error('Error:', error);
        });
    });

    // task category
    const categoryBtn = document.querySelectorAll('.categoryBtn');
    Array.from(categoryBtn).forEach(btn => {
        btn.addEventListener('click', event => {
            event.preventDefault();
            window.location.href = '../UserDashboard'
        })
    })

    // get the accesstoken from local storage
    let accessToken: string | null = localStorage.getItem('accessToken');

    // task creation
    if(window.location.pathname == '/createTask'){
        const taskForm = document.getElementById('create-task-form') as HTMLElement || '';
        const cancelCreate = document.getElementById('cancelCreateTask') as HTMLElement || '';
        cancelCreate.addEventListener('click', event => {
            event.preventDefault()
            window.location.href = '../AdminDashboard';
        })
        taskForm?.addEventListener('submit', async (event) => {
            event.preventDefault();

            message.style.visibility = 'visible';

            function updateMessage(element: HTMLElement, type: 'success' | 'warning' | 'danger', text: string) {
                element.classList.remove('alert-light', 'alert-success', 'alert-warning', 'alert-danger');
                element.classList.add(`alert-${type}`);
                element.innerHTML = text;
            }

            async function getAdminGroupId(accessToken: string | null) {
                const response = await getUserInfo(accessToken);
                const data = await response.json();
                return data.id; // This will return the id after the promise resolves
            }
              
            // Usage
            const adminGroupId = await getAdminGroupId(accessToken); // Use this inside an async function

            const title = document.getElementById('taskTitle') as HTMLInputElement || '';
            const description = document.getElementById('description') as HTMLInputElement || '';
            const dueDateInput = document.getElementById('due-date') as HTMLInputElement;
            const dueDate = dueDateInput ? new Date(dueDateInput.value).toString() : new Date().toString();
            const priority = document.getElementById('priority') as HTMLInputElement || '';

            const userData: CreateTask = { 
                title: title?.value || '',
                description: description?.value || '',
                dueDate: new Date((dueDate).toString()).toISOString() || new Date().toISOString(),
                priority: priority?.value || 'low',
                groupId: adminGroupId.toString(),
            };

            console.log('duedate us here:', userData.dueDate)
            createTask(userData, accessToken).then((response) => {
                if (response.ok) {
                    updateMessage(message!, 'success', 'Task created successfully');
                    console.log('Task created successfully');
                    setTimeout(() => {
                        window.location.href = '/AdminDashboard'
                    }, 3000)
                } else if (response.status === 403) {
                    updateMessage(message!, 'warning', 'Task not created. Please try again');
                    console.log('Task not created. Please try again');
                } else {
                    updateMessage(message!, 'danger', 'An error occurred');
                    console.log('An error occurred');
                }
            }).catch(error => {
                updateMessage(message!, 'danger', 'An error occurred');
                console.error('Error:', error);
            });
        });
    }

    // Admin dashboard
    if(window.location.pathname === '/AdminDashboard'){
        getUserInfo(accessToken).then(response => {
            if(response.ok){
                response.json().then(data => {
                    const userName = document.getElementById('username') as HTMLElement;
                    userName.innerHTML = data.firstname + ' ' + data.lastname;
                    const userRole = document.getElementById('userrole') as HTMLElement;
                    userRole.innerHTML = data.role;
                    console.log(data)
                })
            }
        })

        const addNewTaskBtn = document.getElementById('addNewTask') as HTMLButtonElement;
        addNewTaskBtn.addEventListener('click', event => {
            event.preventDefault()
            window.location.pathname = './createTask'
        })
        
        interface Task {
            title: string;
            description: string;
            dueDate: string; // Date in ISO format (e.g. "2025-01-10")
            priority: string;
        }

        async function getAdminGroupId(accessToken: string | null) {
            const response = await getUserInfo(accessToken);
            const data = await response.json();
            return data.id; // This will return the id after the promise resolves
        }
          
          // Usage
        const adminGroupId = await getAdminGroupId(accessToken); // Use this inside an async function

        // 1, get tasks
        getTasks(accessToken, adminGroupId).then((tasks) => {
            console.log(tasks)
            if (tasks) {
                console.log('Getting tasks successfully');
                
                // Filter admin tasks or any other criteria you need
                const adminTasks = tasks;
            
                
                const taskList = document.getElementById('taskListContainer') as HTMLElement;
                taskList.innerHTML = '';  // Clear the task list before adding new tasks
                
                adminTasks.forEach((task: any) => {  // Use 'task' for each individual task in the loop
                    const taskElement = document.createElement('div');
                    taskElement.classList.add('list-group-item', 'list-group-item-action', 'd-flex', 'justify-content-between', 'p-4', 'rounded', 'mb-3');
                    taskElement.id = `task-${task.id}`; // Set unique ID for task elements
                    
                    taskElement.innerHTML = `
                        <div>
                            <h5 class="mb-1">${task.title}</h5>
                            <p class="mb-1">${task.description}</p>
                            <small>Due Date: ${task.dueDate}</small><br>
                            <span class="badge bg-warning p-2">${task.priority}</span>
                        </div>
                        <div style="width: 130px; text-align: end">
                            <button class="btn btn-primary btn-sm me-2" id="edit-btn-${task.id}">Edit</button>
                            <button class="btn btn-danger btn-sm" id="delete-btn-${task.id}">Delete</button>
                        </div>
                    `;
                    taskElement.style.marginBottom = '10px';
                    taskList.appendChild(taskElement);

                    // Add event listener for the Edit button
                    const editButton = document.getElementById(`edit-btn-${task.id}`);
                    editButton?.addEventListener('click', () => editTaskFunc(task.id)); // Pass task.id dynamically

                    const deleteButton = document.getElementById(`delete-btn-${task.id}`);
                    deleteButton?.addEventListener('click', () => deleteTaskFunc(task.id)); // Pass task.id dynamically
                });
            } else {
                console.error('Failed to retrieve tasks');
            }
        }).catch((error) => {
            console.log('Error fetching tasks:', error);
        });
                
        // 3, Edit tasks
        async function editTaskFunc(taskId: number) {
            const editContainer = document.getElementById('edit-task-container') as HTMLElement;
            editContainer.style.display = 'block';

            const canceleditBtn = document.getElementById('canceledit') as HTMLElement;
            canceleditBtn.addEventListener('click', () => {
                setTimeout(() => {
                    editContainer.style.display = 'none';
                }, 2000);
            })
            
            const edittaskBtn = document.getElementById('edittaskbtn') as HTMLElement;
            
            edittaskBtn.addEventListener('click', event => {
                event.preventDefault()

                const newTitle = document.getElementById("newTitle") as HTMLInputElement || '';
                const newDescription = document.getElementById("newDescription") as HTMLInputElement || '';
                const newDueDateInput = document.getElementById("newDuedate") as HTMLInputElement || '';
                const newDueDate = newDueDateInput ? new Date(newDueDateInput.value).toString() : new Date().toString();
                const newPriority = document.getElementById("newPriority") as HTMLInputElement || '';

                if (newTitle && newDescription && newDueDate && newPriority) {
                    const updatedTask: Task = {
                    title: newTitle?.value || '',
                    description: newDescription?.value || '',
                    dueDate: new Date((newDueDate).toString()).toISOString() || new Date().toISOString(),
                    priority: newPriority?.value || 'low',
                    };

                    console.log(updatedTask);

                    editTask(updatedTask, accessToken, taskId).then(response => {
                        console.log(updatedTask)
                        if(response.ok){
                            // updateMessage(message!, 'success', 'Task edited successfully')
                            setTimeout(() => {
                                window.location.href = '/AdminDashboard'
                            }, 3000)
                        }
                        else if (response.status === 403) {
                            console.log('Task not edited. Please try again');
                        } else {
                            // updateMessage(message!, 'danger', 'An error occurred');
                            console.log('An error occurred');
                        }
                    }).catch(error => {
                        console.log('error occured', error)
                    })

                    setTimeout(() => {
                        editContainer.style.display = 'none';
                    }, 2000);
                }
                
            })  
        }
        

        // 3, Delete tasks
        async function deleteTaskFunc(taskId: number) {
            if (confirm('Are you sure you want to delete this task?')) {
                deleteTask(accessToken, taskId).then(response => {
                    console.log(accessToken)
                    console.log(taskId)
                    if(response.ok){
                        // updateMessage(message!, 'success', 'Task edited successfully')
                        console.log(response);
                        setTimeout(() => {
                            window.location.href = '/AdminDashboard'
                        }, 3000)
                    }
                    else if (response.status === 403) {
                        console.log('Task not DELLETED. Please try again');
                    } else {
                        console.log('An error occurred');
                    }
                }).catch(error => {
                    console.log('error occured', error)
                })
            }
        }

        // logout from dashboard
        const logOutBtn = document.getElementById('logOutBtn') as HTMLElement || '';
        logOutBtn.onclick = function logout() {
            console.log('clicked')
            localStorage.removeItem('accessToken'); // Clear the invalid token
            window.location.href = './home'; // Redirect to home
        }
          
        getTasks();  // Call the function to load tasks when the page is loaded          
    }

    // user dashboard

    if(window.location.pathname === '/UserDashboard'){
        // 1, get tasks
        async function groupId(accessToken: string | null) {
            const response = await getUserInfo(accessToken);
            const data = await response.json();
            return data.groupId; // This will return the id after the promise resolves
        }
        
        // Usage
        const groupid = await groupId(accessToken); // Use this inside an async function
        getTasks(accessToken, groupid).then((tasks) => {
            console.log(tasks)
            if (tasks) {
                console.log('Getting tasks successfully');
                console.log(tasks)
                
                // Filter admin tasks or any other criteria you need
                const userTasks = tasks;
                console.log(tasks)
                
                const taskList = document.getElementById('taskListContainer') as HTMLElement;
                taskList.innerHTML = '';  // Clear the task list before adding new tasks
                
                // Save task as completed in localStorage
                    function saveTaskCompletedState(taskId: any) {
                        const completedTasks = JSON.parse(localStorage.getItem('completedTasks') || '[]');
                        if (!completedTasks.includes(taskId)) {
                        completedTasks.push(taskId);
                        localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
                        }
                    }
                    
                    // Load completed tasks from localStorage on page load
                    function loadCompletedTasks() {
                        const completedTasks = JSON.parse(localStorage.getItem('completedTasks') || '[]');
                        completedTasks.forEach((taskId: any) => {
                        const taskElement = document.getElementById(`task-${taskId}`);
                        if (taskElement) {
                            // Apply "completed" styles
                            taskElement.style.backgroundColor = '#d4edda';
                            taskElement.style.borderColor = '#c3e6cb';
                    
                            const completedButton = document.getElementById(`completed-btn-${taskId}`);
                            if (completedButton) {
                            completedButton.innerText = 'Completed';
                            completedButton.classList.remove('btn-outline-success');
                            completedButton.classList.add('btn-success');
                            completedButton.setAttribute('disabled', 'true');
                            }
                        }
                        });
                    }
                    
                    // Loop through tasks and add functionality
                    userTasks.forEach((task: { id: any; title: any; description: any; dueDate: any; priority: any; }) => {
                        const taskElement = document.createElement('div');
                        taskElement.classList.add('list-group-item', 'list-group-item-action', 'd-flex', 'justify-content-between');
                        taskElement.id = `task-${task.id}`;
                    
                        taskElement.innerHTML = `
                        <div>
                            <h5 class="task-status">${task.title}</h5>
                            <p class="task-status">${task.description}</p>
                            <p class="task-status">Due Date: ${task.dueDate}</p>
                            <p class="task-date">${task.priority}</p>
                        </div>
                        <div style="width: 170px; text-align: end">
                            <button class="btn btn-outline-success btn-sm" id="completed-btn-${task.id}">Mark Completed</button>
                        </div>
                        `;
                        taskElement.style.marginBottom = '10px';
                        taskList.appendChild(taskElement);
                    
                        const completedButton = document.getElementById(`completed-btn-${task.id}`);
                        completedButton?.addEventListener('click', () => {
                        taskElement.style.backgroundColor = '#d4edda';
                        taskElement.style.borderColor = '#c3e6cb';
                        completedButton.innerText = 'Completed';
                        completedButton.classList.remove('btn-outline-success');
                        completedButton.classList.add('btn-success');
                        completedButton.setAttribute('disabled', 'true');
                        saveTaskCompletedState(task.id); // Save the state to localStorage
                        });
                    });
                    
                    // Call this function to apply saved states on page load
                    loadCompletedTasks();
            } else {
                console.error('Failed to retrieve tasks');
            }
        }).catch((error) => {
            console.log('Error fetching tasks:', error);
        });

        getUserInfo(accessToken).then(response => {
            if(response.ok){
                console.log(response.json().then(data => {
                    const userName = document.getElementById('username') as HTMLElement;
                    userName.innerHTML = data.firstname + ' ' + data.lastname;
    
                    const userRole = document.getElementById('userrole') as HTMLElement;
                    userRole.innerHTML = data.role;
                }))
            }
        })
        const logOutBtn = document.getElementById('logOutBtn') as HTMLElement || '';
        logOutBtn.onclick = function logout() {
            console.log('clicked')
            localStorage.removeItem('accessToken'); // Clear the invalid token
            window.location.href = './home'; // Redirect to home
        }
        getTasks()
    }
    
    
    // check for token is not invalid
    function checkAuthentication() {
        if (!accessToken) {
            // Redirect if no token is found
            window.location.href = './home';
            return;
        }

        try {
            // Decode the token if it's a JWT (JSON Web Token) to check its expiration
            const payload = JSON.parse(atob(accessToken.split('.')[1])); // Decode the payload
            const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

            if (payload.exp && payload.exp < currentTime) {
                // If token is expired
                localStorage.removeItem('accessToken'); // Clear the invalid token
                window.location.href = './home'; // Redirect to home
            }
        } catch (error) {
            console.error('Invalid access token format', error);
            localStorage.removeItem('accessToken'); // Clear malformed token
            window.location.href = './home'; // Redirect to home
        }
    }

    const publicPaths = ['/home', '/signin', '/signup']; // Add your public paths here
    const currentPath = window.location.pathname; // Extract the pathname from the URL

    if (!publicPaths.includes(currentPath)) {
        checkAuthentication();
    }
});