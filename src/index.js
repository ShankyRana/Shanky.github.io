let totalTasks = 0;
let tasks = [];
let servers = [{
  id: 'server-1',
  status: false
}];
let noOfRemovalRequests = 0;

/****************************************************************
 ********************* Server function **************************
 ***************************************************************/

/**
 * add server to task manager
 */
function addServer() {
  const noOfServers = servers.length;
  if (noOfServers < 10) {
    servers.push({
      id: `server-${servers.length+1}`,
      status: false
    });

    updateServerCount();
  }
}

/**
 * remove server from task manager
 */
function removeServer() {
  const serverLength = servers.length;
  if (serverLength > 1) {
    servers.some(function (server, index) {
      if (!server.status) {
        servers.splice(index, 1);
        return true;
      }
    });

    if (serverLength === servers.length) {
      noOfRemovalRequests++;
    } else if (noOfRemovalRequests > 0) {
      noOfRemovalRequests--;
    }

    updateServerCount();
  }
}

/**
 * update number of servers on DOM
 */
function updateServerCount() {
  const noOfServers = document.getElementById("noOfServers");
  noOfServers.textContent = servers.length;
}

/**
 * update server status
 * @param serverId unique id of server
 * @param value server value
 */
function updateServerStatus(serverId, value) {

  servers = servers.map(server => {
    if (server.id === serverId) {
      server.status = value;
    }
    return server;
  });

  const busyServer = servers.filter(server => server.status);

  const busyServers = document.getElementById("runningServers");
  busyServers.textContent = busyServer.length;

}

/****************************************************************
 ********************* Tasks function **************************
 ***************************************************************/

/**
 * add task to task manager
 */
function addTask() {
  const ul = document.getElementById("task-list");
  const taskInput = document.getElementById("task-input");

  for (let i = 0; i < taskInput.value; i++) {
    const taskId = ++totalTasks;

    tasks.push({
      id: taskId,
      status: false
    });

    createTaskItem(ul, taskId);
  }

  taskInput.setAttribute('value', '');
  updateTaskCount();
}

/**
 * create and add task item to DOM
 */
function createTaskItem(ul, taskId) {
  const li = document.createElement("li");

  const itemBar = document.createElement("div");
  const itemText = document.createTextNode(`Task ${taskId} waiting .....................`);

  itemBar.setAttribute("class", "task-item");
  itemBar.appendChild(itemText);

  const itemIcon = document.createElement("i");
  const iconText = document.createTextNode("delete");

  itemIcon.setAttribute("class", "material-icons");
  itemIcon.appendChild(iconText);
  itemIcon.setAttribute("onclick", `removeTask(${taskId}, ${true})`);

  li.appendChild(itemBar);
  li.appendChild(itemIcon);
  li.setAttribute("id", taskId);

  ul.appendChild(li);
}

/**
 * remove task item from DOM and task list
 */
function removeTask(taskId, updateList) {
  const ul = document.getElementById("task-list");
  const taskElement = document.getElementById(taskId);

  ul.removeChild(taskElement);
  if (updateList) {
    tasks = tasks.filter(task => task.id !== taskId);
  }

  updateTaskCount();
}

/**
 * update task status
 * @param taskId unique id of task
 * @param value task value
 */
function updateTaskStatus(taskId, value) {
  tasks = tasks.map(task => {
    if (task.id === taskId) {
      task.status = value;
    }
    return task;
  })
}

/**
 * update tasks status on DOM
 */
function updateTaskCount() {
  const totalTasksElement = document.getElementById("totalTasks");
  const tasksCompletedElement = document.getElementById("tasksCompleted");

  totalTasksElement.textContent = totalTasks;
  tasksCompletedElement.textContent = totalTasks - tasks.length;
}

/****************************************************************
 ********************* Progress function ************************
 ***************************************************************/

/**
 * create progress bar in DOM
 * @param taskId unique id of task
 */
function createProgressBar(taskId) {

  const taskBars = document.getElementById("task-bars");

  const progressItem = document.createElement("div");
  progressItem.setAttribute("class", "task-progress");
  progressItem.setAttribute("id", `task-progress-${taskId}`);

  const progressBar = document.createElement("div");
  const progressBarText = document.createTextNode("00:00");

  progressBar.setAttribute("id", `task-bar-${taskId}`);
  progressBar.setAttribute("class", `task-bar`);

  progressBar.appendChild(progressBarText);
  progressItem.appendChild(progressBar);

  taskBars.appendChild(progressItem);

}

/**
 * removes progress bar for DOM
 * @param taskId unique id of task
 */
function removeProgressBar(taskId) {
  const taskBars = document.getElementById("task-bars");
  const progressBar = document.getElementById(`task-progress-${taskId}`);

  taskBars.removeChild(progressBar);
}

/**
 * starts progress bar and updates it on DOM
 * @param taskId unique id of task
 * @param serverId unique id of task
 */
function runProgress(taskId, serverId) {

  const elem = document.getElementById(`task-bar-${taskId}`);
  const intervalId = setInterval(bar, 1000);
  let width = 0;

  function bar() {
    if (width >= 100) {
      console.log(noOfRemovalRequests, '=-=-=-=-=-=-=>noOfRemovalRequests');

      clearInterval(intervalId);
      removeProgressBar(taskId);
      tasks = tasks.filter(task => task.id !== taskId);
      updateTaskCount();
      updateServerStatus(serverId, false);
      if (noOfRemovalRequests) {
        removeServer();
      }
    } else {
      width += 5;
      elem.style.width = width + '%';
      let time = width / 5
      elem.innerHTML = `00:${time<10?'0'+time:time}`;
    }
  }
}


/****************************************************************
 ************************ Task Manager **************************
 ***************************************************************/

/**
 * run task from queue
 */
function runTask() {

  if (tasks.length) {

    tasks.map(async task => {
      const freeServer = servers.find(server => !server.status);

      if (freeServer && !task.status) {
        await updateServerStatus(freeServer.id, task.id);
        removeTask(task.id)
        updateTaskStatus(task.id, 'running');
        updateTaskCount();
        createProgressBar(task.id);
        runProgress(task.id, freeServer.id);
      }
    });
  }
}

/****************************************************************
 *********************** Startup funtion ************************
 ***************************************************************/

/**
 * task manager init
 */
(function startup() {
  const noOfServers = document.getElementById("noOfServers");
  const noOfServersText = document.createTextNode(servers.length);
  noOfServers.appendChild(noOfServersText);

  setInterval(runTask, 1000);

})();