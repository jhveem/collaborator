MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

APP = new Vue({
  el: '#vue-app',
  mounted: async function() {
    //get information from the url
    if (this.rPagesURL.test(window.location.pathname)) {
      //page specific menu
      let pieces = window.location.pathname.match(this.rPagesURL);
      this.courseId = parseInt(pieces[1]);
      this.pageType = pieces[2];
      this.pageId = pieces[3];
    } else if (this.rMainURL.test(window.location.pathname)) {
      //not in a specific page
      let pieces = window.location.pathname.match(this.rMainURL);
      this.courseId = parseInt(pieces[1]);
    }
    //this.loadSettings();
    await this.SETTINGS._init(this);
    /* This needs to happen async so the stuff that matters isn't caught up on it
    this.canvasQuizzes = await this.API.getCourseQuizzes(this.courseId);
    this.canvasPages = await this.API.getCoursePages(this.courseId);
    this.canvasAssignments = await this.API.getCourseAssignments(this.courseId);
    */
    await this.loadTodos();
    //await this.loadProjects();
    for (let i = 0; i < this.projectMembers.length; i++) {
      let userId = this.projectMembers[i];
      this.loadUserName(userId);
    }
    this.$set(this, 'pageTypes', this.pageTypes);
    $("#canvas-collaborator-modal").draggable();

    //get page/quiz/assignment info for progress data
  },
  data: function() { 
    return {
      userSettings: {
        showResolved: true, 
      },
      openTabs: [],
      canvasQuizzes: [],
      canvasPages: [],
      canvasAssignments: [],
      modal: '',
      userNames: {},
      userId: ENV.current_user_id,
      menuCurrent: "projects",
      currentProject: null,
      rMainURL: /^\/courses\/([0-9]+)/,
      rPagesURL: /^\/courses\/([0-9]+)\/([a-z]+)\/(.+?)(\/|$|\?)/,
      API: COLLABORATOR_API_FUNCTIONS,
      SETTINGS: COLLABORATOR_SETTINGS_FUNCTIONS, 
      pageType: '',
      pageId: '',
      header: 'projects',
      menuItems: [],
      todos: [],
      pageTypes: { 
        quizzes: 'quizzes',
        assignments: 'assignments',
        pages: 'pages'
      },
      modalObject: {},
      newProjectName: '',
      modalTodoProject: {},
      newTodoName: '',
      newTodoPageTypes: [],
      newTodoProject: '',
      projectTags: [],
      newTodoAssignments: [],
      newCommentText: '',
      newCommentTodo: '',
      projectMembers: [
        '1893418', //Josh 
        '1864953', //Danni
        '1891741', //Katie
        '1638854', //Mason
        '1922029', //Makenzie
        '1807337', //Jon
      ]
    }
  },
  methods: {
    goto: function(menuName) {
      this.menuCurrent = menuName;
      this.menuItems = this.menus[menuName];
      this.header = menuName;
    },
    loadTodos: async function() {
      let todos = await this.API.getTodos(this.courseId);
      for (let t in todos) {
        let todo = todos[t];
        if (todos.tags === undefined) {
          todo['tags'] = {};
        }
      }
      this.todos = todos;
    },
    loadProjects: async function() {
      let projects = await this.API.getProjects(this.courseId);
      for (let p in projects) {
        let project = projects[p];
        if (project.tags === undefined) {
          project['tags'] = {};
        }
      }
      this.updateProjectList(projects);
    },
    updateProjectList(projects) {
      for (let p = 0; p < projects.length; p++) {
        let project = projects[p];
        this.updateProjectInList(project);
      }
    },
    updateProjectInList(project) {
      let exists = false;
      for (let i =0; i < this.loadedProjects.length; i++) {
        let checkProject = this.loadedProjects[i];
        if (checkProject._id === project._id) {
          for (let key in project) {
            this.$set(checkProject, key, project[key]);
          }
          exists = true;
        }
      }
      //might be able to get rid of this, because we're no longer adding additional variable of collapsed, so we can read straight from the projects variable
      if (exists === false) {
        project.loadedTodos = [];
        this.loadedProjects.push(project);
        this.setProjectTodos(project);
      }
    },
    async createProject() {
      let project = await this.API.createProject(this.courseId, this.newProjectName);
      this.updateProjectInList(project);
    },
    async updateProject(project) {
      //possible base this off of modal object
      let updatePackage = {
        name: project.name,
      };
      await this.API.updateProject(project._id, updatePackage);
    },
    async deleteProject(project) {
      await this.API.deleteProject(project._id);
      //remove project from list
      for (let i =0; i < this.loadedProjects.length; i++) {
        let checkProject = this.loadedProjects[i];
        if (project._id === checkProject._id) {
          this.loadedProjects.splice(i, 1);
          break;
        }
      }
    },
    async setProjectTodos(project) {
      let todos = await this.getTodos(project);
      for (let t = 0; t < todos.length; t++) {
        let todo = todos[t];
        todo['loadedComments'] = [];
      }
      this.$set(project, 'loadedTodos', todos);
    },
    async getTodos(project) {
      let todos;
      if (this.pageType !== '') {
        todos = await this.API.getTodosPage(project._id, this.pageType, this.pageId);
      } else {
        todos = await this.API.getTodosProject(project._id);
      }
      for (let t in todos) {
        let todo = todos[t];
        this.calcTodoProgress(todo);
        this.loadComments(todo);
      }
      return todos;
    },
    async createTodo(todoData) {
      let pageId = '';
      if (todoData.pageSpecific) {
        pageId = this.pageId; 
        todoData.pageTypes = [this.pageType];
      }
      let todo = await this.API.createTodo(todoData.projectId, todoData.name, todoData.pageTypes, todoData.assignments, pageId);
      todo.loadedComments = [];
      for (let i =0; i < this.loadedProjects.length; i++) {
        let project = this.loadedProjects[i];
        if (todoData.projectId === project._id) {
          project.loadedTodos.push(todo);
          break;
        }
      }
    },
    async updateTodo(todo) {
      //possible base this off of modal object
      if (todo.pageSpecific) {
        todo.pageTypes = [this.pageType];
        todo.pageId = this.pageId;
      } else {
        todo.pageId = '';
      }
      let updatePackage = {
        name: todo.name,
        assignments: todo.assignments,
        pageTypes: todo.pageTypes,
        pageId: todo.pageId,
        tags: todo.tags
      };
      await this.API.updateTodo(todo._id, updatePackage);
    },
    async assignTodo(todo, assignments) {
      await this.API.assignTodo(todo._id, assignments)
      todo.assignments.push(assigments);
      this.$set(todo, 'assignments', todo.assignments);
    },
    async resolveTodo(todo) {
      await this.API.resolveTodoPage(todo._id, this.pageType, this.pageId);
      todo.pages.push({'pageType': this.pageType, 'pageId': this.pageId});
    },
    async unresolveTodo(todo) {
      await this.API.unresolveTodoPage(todo._id, this.pageType, this.pageId);
      for (let p = 0; p < todo.pages.length; p++) {
        let page = todo.pages[p];
        if (page.pageType === this.pageType && page.pageId === this.pageId) {
          todo.pages.splice(p, 1);
          break;
        }
      }
    },
    async calcTodoProgress(todo) {
      let counts = {};
      counts['quizzes'] = (this.canvasQuizzes.length);
      counts['pages'] = (this.canvasPages.length);
      counts['assignments'] = (this.canvasAssignments.length);
      let resolved = {};
      resolved['quizzes'] = 0;
      resolved['pages'] = 0;
      resolved['assignments'] = 0;
      let total = 0;
      let resolvedTotal = 0;
      for (let pd in todo.pages) {
        let pageData = todo.pages[pd];
        resolved[pageData.pageType] += 1;
      }
      for (let p in todo.pageTypes) {
        let type = todo.pageTypes[p];
        total += counts[type];
        resolvedTotal += resolved[type];
      }
      todo.progress = ((resolvedTotal / total) * 100).toFixed(2);
    },
    async deleteTodo(todo) {
      //some kind of check to make sure this worked
      for (let p = 0; p < this.loadedProjects.length; p++) {
        let project = this.loadedProjects[p];
        if (project._id === todo.projectId) {
          let todos = project.loadedTodos;
          for (let t = 0; t < todos.length; t++) {
            if (todos[t]._id === todo._id) {
              todos.splice(t, 1);
              break;
            }
          }
          break;
        }
      }
      await this.API.deleteTodo(todo._id);
    },
    async loadUserName(userId) {
      let userName = '';
      if (this.userNames[userId] === undefined) {
        userName = await this.API.getUserName(userId);
        this.userNames[userId] = userName;
      }
    },
    async setUserName(comment) {
      if (this.userNames[comment.user] === undefined) {
        comment.userName = await this.API.getUserName(comment.user);
        this.userNames[comment.user] = comment.userName;
      } else {
        comment.userName = this.userNames[comment.user];
      }
      return;
    },
    async loadComments(todo) {
      let comments = await this.API.getComments(todo._id, this.pageType, this.pageId);
      for (let c = 0; c < comments.length; c++) {
        let comment = comments[c];
        await this.setUserName(comment);
      }
      this.$set(todo, 'loadedComments', comments);
    },
    async createComment(todo) {
      let comment = await this.API.createComment(this.newCommentTodo, this.newCommentText, this.pageType, this.pageId);
      await this.setUserName(comment);
      if (todo.loadedComments === undefined) {
        todo.loadedComments = [];
      }
      todo.loadedComments.push(comment);
      this.newCommentText = '';
    },
    async deleteComment(todo, comment) {
      this.API.deleteComment(comment._id);
      for (let t = 0; t < todo.loadedComments.length; t++) {
        let checkComment = todo.loadedComments[t];
        if (comment._id === checkComment._id) {
          todo.loadedComments.splice(t, 1);
        }
      }
    },
    async toggle(obj) {
      if (this.openTabs.includes(obj._id)) { //if it's already open, remove it
        this.openTabs = this.openTabs.filter(function(e) { return e !== obj._id });
      } else { //add it
        this.openTabs.push(obj._id);
      }
      this.API.saveSettingCourse(this.userId, this.courseId, 'openTabs', this.openTabs);
    },
    openModal(name, modalObject) {
      this.modal=name;
      this.modalObject = modalObject;
      if (name === 'edit-todo') {
        this.modalObject.pageSpecific = !(modalObject.pageId === '');
      }
    },
    checkModal(name) {
      return this.modal===name;
    },
    closeModal() {
      if (this.modal === 'edit-project') {
        this.updateProject(this.modalObject);
      }
      if (this.modal === 'edit-todo') {
        this.updateTodo(this.modalObject);
      }
      if (this.modal === 'settings') {
        this.API.saveSettingGeneral(this.userId, 'userSettings', this.userSettings);
      }
      this.modalObject = {};
      this.modal = '';
      this.newTodoName = '';
      this.newTodoPageTypes = [];
      this.newProjectName = '';
      this.newCommentTodo = '';
      this.newTodoAssignments = [];
    },  
    toggleWindow(show=null) {
      let canvasbody = $("#application");
      if (show === null) {
        let mRight = canvasbody.css("margin-right");
        if (mRight === "300px") {
          show = false;
        }
        if (mRight === "0px") {
          show = true;
        }
      }
      this.API.saveSettingGeneral(this.userId, 'showMenu', show);
      if (!show) {
        canvasbody.css("margin-right", "0px");
        $("#canvas-collaborator-container").hide();
      }
      if (show) {
        canvasbody.css("margin-right", "300px");
        $("#canvas-collaborator-container").show();
      }
    }
  },

});