const COLLABORATOR_API_FUNCTIONS = {
  URL_BASE: "https://jhveem.xyz/api/",
  APP: {},
  _init(app) {
    this.APP = app;
  },
  async getUserName(userId) {
    let url = "/api/v1/users/"+userId;
    let res = await axios.get(url);
    return res.data.name;
  },
  async getTodosCourse(courseId) {
    let self = this;
    let url = self.URL_BASE + "todos/courses/" + courseId;
    let res = await axios.get(url);
    return res.data;
  },
  async getTodosPage(courseId, pageType, pageId) {
    let self = this;
    let url = self.URL_BASE + "todso/courses/" + courseId + "/pages/"+pageType+"/"+pageId;
    let res = await axios.get(url);
    return res.data;
  },
  async createTodo(courseId, name, parentId = '', pageTypes = [''], assignments = [''], pageId = '') {
    let self = this;
    let url = self.URL_BASE + "todos/courses/" + courseId;
    if (typeof assignments === 'string') assignments = [assignments];
    let res = await axios.post(url, {
      'name': name,
      'pageTypes': pageTypes,
      'assignments': assignments,
      'pageId': pageId,
      'parentId': parentId
    });
    return res.data;
  },
  async updateTodo(todoId, updatePackage) {
    let self = this;
    let url = self.URL_BASE + "todos/" + todoId;
    await axios.put(url, updatePackage);
  },
  async resolveTodoPage(todoId, pageType, pageId) {
    //the page type and page id might be unnecessary
    let self = this;
    let url = self.URL_BASE + "todos/" + todoId + "/resolve";
    let returnData = null;
    await $.put(url, {
      'pageType': pageType,
      'pageId': pageId
    }, function(data) {
      returnData = data;
    });
    return returnData;
  },
  async unresolveTodoPage(todoId, pageType, pageId) {
    //the page type and page id might be unnecessary
    let self = this;
    let url = self.URL_BASE + "todos/" + todoId + "/unresolve";
    await axios.put(url, {
      'pageType': pageType,
      'pageId': pageId
    });
    return;
  },
  async assignTodo(todoId, assignments) {
    let self = this;
    let url = self.URL_BASE + "todos/" + todoId + "/assignment";
    await axios.put(url, {
      'assignments': assignments
    });
  },
  async deleteTodo(todoId) {
    let self = this;
    let url = self.URL_BASE + "todos/" + todoId;
    await axios.delete(url);
    return;
  },
  async createComment(todoId, text, pageType, pageId) {
    let self = this;
    let url = self.URL_BASE + "todos/" + todoId + "/comment";
    let returnData = null;
    await $.post(url, {
      'text': text,
      'user': ENV.current_user_id,
      'pageType': pageType,
      'pageId': pageId
    }, function (data) {
      returnData = data;
    });
    return returnData;
  },
  async getComments(todoId, pageType='', pageId='') {
    let self = this;
    let url = self.URL_BASE + "todos/" + todoId + "/comments";
    if (pageType !== '' || pageId !== '') {
      url = self.URL_BASE + "todos/" + todoId + "/comments/pages/"+pageType+"/"+pageId;
    }
    let returnData = null;
    let res = await axios.get(url);
    return res.data;
  },
  async deleteComment(commentId) {
    let self = this;
    let url = self.URL_BASE + "comments/" + commentId;
    let res = await axios.delete(url);
    return res.data;
  },
  async updateComment(commentId, data) {
    let self = this;
    let url = self.URL_BASE + "comments/" + commentId;
    return axios.put(url, data);
  },
  async loadSettingsGeneral(userId) {
    let url = "/api/v1/users/"+userId+"/custom_data/canvas_collaboration/general";
    try {
      let res = await axios.get(url, {
        params: {
          ns: 'edu.btech.canvas-app'
        }
      });
      let settings = res.data;
      return settings;
    } catch (e) {
      console.log(e);
    }
  },
  async loadSettingsCourse(userId, courseId) {
    let url = "/api/v1/users/"+userId+"/custom_data/canvas_collaboration/" + courseId;
    try {
      let res = await axios.get(url, {
        params: {
          ns: 'edu.btech.canvas-app'
        }
      });
      let settings = res.data;
      return settings;
    } catch (e) {
      console.log(e);
    }
  },
  async saveSettingGeneral(userId, setting, val) {
    if (Array.isArray(val)) {
      if (val.length === 0) {
        //delete it instead of putting it
        val = '';
      }
    }
    let url = "/api/v1/users/"+userId+"/custom_data/canvas_collaboration/general/"+setting+"?ns=edu.btech.canvas-app";
    try {
      await $.put(url, {
        ns: 'edu.btech.canvas-app',
        data: val,
      });
    } catch (e) {
      console.log(e);
    }
  },
  async saveSettingCourse(userId, courseId, setting, val) {
    if (Array.isArray(val)) {
      if (val.length === 0) {
        //delete it instead of putting it
        val = '';
      }
    }
    let url = "/api/v1/users/"+userId+"/custom_data/canvas_collaboration/" + courseId + "/"+setting+"?ns=edu.btech.canvas-app";
    try {
      await $.put(url, {
        ns: 'edu.btech.canvas-app',
        data: val,
      });
    } catch (e) {
      console.log(e);
    }
  },
  async getCoursePages(courseId) {
    let url = "/api/v1/courses/" + courseId + "/pages?per_page=100";
    let res = await axios.get(url);
    let data = res.data;
    return data;
  },
  async getCourseAssignments(courseId) {
    let url = "/api/v1/courses/" + courseId + "/assignments?per_page=100";
    let res = await axios.get(url);
    let data = res.data;
    return data;
  },
  async getCourseQuizzes(courseId) {
    let url = "/api/v1/courses/" + courseId + "/quizzes?per_page=100";
    let res = await axios.get(url);
    let data = res.data;
    return data;
  }
}
