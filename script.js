// ================================
//  KANBAN BOARD LOGIC
// ================================

// Selected Elements
const addBtn = document.querySelector(".add-btn");
const modalCont = document.querySelector(".modal-cont");
const modalTaskArea = document.querySelector(".textArea-cont");
const mainTicketContainer = document.querySelector(".main-cont");
const allPriorityColors = document.querySelectorAll(".priority-color");

const colors = ["lightpink", "lightgreen", "lightblue", "black"];

let ticketsArr = [];

let ticketColor = "lightpink";

// lock Classes
let openedLock = "fa-lock-open";
let closedLock = "fa-lock";

// --------- Load tickets from localStorage safely ----------
function initTickets() {
  const stored = localStorage.getItem("myTickets");
  if (!stored) return; // nothing saved yet

  let LStickets;
  try {
    LStickets = JSON.parse(stored);
  } catch (err) {
    console.error("Error parsing saved tickets:", err);
    return;
  }

  if (!Array.isArray(LStickets)) return;

  LStickets.forEach(function (ticket) {
    generateTicket(ticket.ticketTask, ticket.ticketId, ticket.ticketColor);
  });

  // Keep in-memory array in sync
  ticketsArr = LStickets;
}

initTickets();

//flags
let modalFlag = false;

// This Event opens and closes the Modal
if (addBtn && modalCont) {
  addBtn.addEventListener("click", function () {
    if (modalFlag === false) {
      modalCont.style.display = "flex";
      modalFlag = true;
    } else {
      modalCont.style.display = "none";
      modalFlag = false;
    }
  });
}

// Create ticket - ticket Generation
function generateTicket(task, id, color) {
  const ticketCont = document.createElement("div");
  ticketCont.setAttribute("class", "ticket-cont");

  ticketCont.innerHTML = `
    <div class="ticket-color" style="background-color: ${color};"></div>
    <div class="ticket-id">${id}</div>
    <div class="task-area">${task}</div>
    <div class="ticket-lock">
      <i class="fa-solid fa-lock"></i>
    </div>
  `;

  mainTicketContainer.appendChild(ticketCont);

  handleLock(ticketCont);
  handleColor(ticketCont);
}

// Create ticket from modal on Shift key
if (modalCont && modalTaskArea) {
  modalCont.addEventListener("keydown", function (e) {
    if (e.key === "Shift") {
      const taskFromModal = modalTaskArea.value.trim();
      if (!taskFromModal) return;

      const id = shortid();
      const color = ticketColor;

      generateTicket(taskFromModal, id, color);

      modalCont.style.display = "none";
      modalFlag = false;
      modalTaskArea.value = "";

      const newTicket = {
        ticketId: id,
        ticketTask: taskFromModal,
        ticketColor: color,
      };

      ticketsArr.push(newTicket);
      localStorage.setItem("myTickets", JSON.stringify(ticketsArr));
    }
  });
}

// Priority selection in modal
allPriorityColors.forEach(function (colorItem) {
  colorItem.addEventListener("click", function () {
    allPriorityColors.forEach(function (priorityColor) {
      priorityColor.classList.remove("active");
    });

    colorItem.classList.add("active");
    ticketColor = colorItem.classList[0]; // e.g. "lightpink"
  });
});

// handle Lock
function handleLock(ticket) {
  const lockContainer = ticket.querySelector(".ticket-lock");
  const lockIcon = lockContainer.children[0];
  const taskArea = ticket.querySelector(".task-area");

  lockIcon.addEventListener("click", function () {
    if (lockIcon.classList.contains(closedLock)) {
      lockIcon.classList.remove(closedLock);
      lockIcon.classList.add(openedLock);
      taskArea.setAttribute("contenteditable", true);
    } else {
      lockIcon.classList.remove(openedLock);
      lockIcon.classList.add(closedLock);
      taskArea.setAttribute("contenteditable", false);
    }
  });
}

// change priority color on ticket
function handleColor(ticket) {
  const ticketColorBand = ticket.querySelector(".ticket-color");

  ticketColorBand.addEventListener("click", function () {
    const currentColor = ticketColorBand.style.backgroundColor; // e.g. "lightpink"
    const currColorIndex = colors.indexOf(currentColor);
    const newColorIdx = (currColorIndex + 1) % colors.length;
    const newColor = colors[newColorIdx];
    ticketColorBand.style.backgroundColor = newColor;
  });
}

// ================================
//  QUICK TO-DO LIST WITH DING SOUND
// ================================

// DOM elements for To-Do
const todoInput = document.querySelector(".todo-input");
const todoAddBtn = document.querySelector(".todo-add-btn");
const todoList = document.querySelector(".todo-list");

// Use the Audio Web API for the "done" sound
// IMPORTANT: Put ding.mp3 in the same folder as index2.html and script.js
const doneSound = new Audio("./ding.mp3");

// LocalStorage key for todos
const TODO_STORAGE_KEY = "taskflowTodos";

let todoItems = [];

// Load existing todos from localStorage
function loadTodos() {
  const saved = localStorage.getItem(TODO_STORAGE_KEY);
  if (!saved) {
    todoItems = [];
    return;
  }

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      todoItems = [];
    } else {
      todoItems = parsed;
    }
  } catch (e) {
    console.error("Error parsing stored todos", e);
    todoItems = [];
  }

  todoItems.forEach(renderTodoItem);
}

// Save todos to localStorage
function saveTodos() {
  localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todoItems));
}

// Render a single todo <li>
function renderTodoItem(item) {
  if (!todoList) return;

  const li = document.createElement("li");
  li.classList.add("todo-item");
  li.dataset.id = item.id;

  if (item.done) {
    li.classList.add("done");
  }

  const span = document.createElement("span");
  span.classList.add("todo-task-text");
  span.textContent = item.text;

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("todo-delete-btn");
  deleteBtn.setAttribute("title", "Delete task");
  deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';

  li.appendChild(span);
  li.appendChild(deleteBtn);
  todoList.appendChild(li);
}

// Add a new todo
function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const newItem = {
    id: Date.now().toString(),
    text: trimmed,
    done: false,
  };

  todoItems.push(newItem);
  saveTodos();
  renderTodoItem(newItem);

  if (todoInput) {
    todoInput.value = "";
    todoInput.focus();
  }
}

// Toggle done + play sound
function toggleTodoDone(id, liElement) {
  const item = todoItems.find((t) => t.id === id);
  if (!item) return;

  const isNowDone = !item.done;
  item.done = isNowDone;

  if (isNowDone) {
    liElement.classList.add("done");
    try {
      doneSound.currentTime = 0;
      doneSound.play();
    } catch (err) {
      console.warn("Could not play done sound:", err);
    }
  } else {
    liElement.classList.remove("done");
  }

  saveTodos();
}

// Delete todo
function deleteTodo(id, liElement) {
  todoItems = todoItems.filter((t) => t.id !== id);
  liElement.remove();
  saveTodos();
}

// Event: add via button click
if (todoAddBtn && todoInput) {
  todoAddBtn.addEventListener("click", function () {
    addTodo(todoInput.value);
  });

  // Event: add via Enter key
  todoInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTodo(todoInput.value);
    }
  });
}

// Event delegation for list: done / delete
if (todoList) {
  todoList.addEventListener("click", function (e) {
    const li = e.target.closest(".todo-item");
    if (!li) return;

    const id = li.dataset.id;

    // Delete
    if (e.target.closest(".todo-delete-btn")) {
      deleteTodo(id, li);
      return;
    }

    // Toggle done when text clicked
    if (e.target.closest(".todo-task-text")) {
      toggleTodoDone(id, li);
      return;
    }
  });
}

// Initialize todos on page load
loadTodos();
