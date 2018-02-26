import Vuex from 'vuex';
import firebase from 'firebase';

const store = () => new Vuex.Store({
  state: {
    user: null,
    authError: {
      show: false,
      msg: null,
    },
    viewedUser: null,
  },
  getters: {
    getUser: state => state.user,
    getAuthError: state => state.authError,
    getViewedUser: state => state.viewedUser,
  },
  mutations: {
    updateUser(state, value) {
      state.user = value;
    },
    updateAuthError(state, value) {
      state.authError = value;
    },
    updateViewedUser(state, value) {
      state.viewedUser = value;
    },
  },
  actions: {
    async GET_A_USER(context, params) {
      const data = await firebase.database().ref(`users/${params.id}`);
      let newData;
      data.on('value', (snapshot) => {
        newData = snapshot.val();
      });
      return newData;
    },
    CREATE_USER(context, user) {
      const usersRef = firebase.database().ref('users');
      const newUserKey = user.uid;
      const newUser = {
        username: user.username,
        email: user.email,
        id: user.uid,
      };
      const updates = {};
      updates[newUserKey] = newUser;
      usersRef.update(updates);
    },
    SIGN_IN(context, signInDetails) {
      firebase.auth().signInWithEmailAndPassword(signInDetails.email, signInDetails.password)
        .then((res) => {
          context.commit('updateUser', res);
          console.log('hello');
          this.$router.replace('/');
        })
        .catch((err) => {
          context.commit('updateAuthError', err);
        });
    },
    SIGN_UP(context, signUpDetails) {
      firebase.auth().createUserWithEmailAndPassword(signUpDetails.email, signUpDetails.password)
        .then((res) => {
          const user = {
            username: signUpDetails.username,
            email: res.email,
            uid: res.uid,
          };
          context.dispatch('CREATE_USER', user);
          context.commit('updateUser', res);
          this.$router.replace('/');
        })
        .catch((err) => {
          context.commit('updateAuthError', err);
        });
    },
    SIGN_OUT(context) {
      firebase.auth().signOut()
        .then(() => {
          context.commit('updateUser', null);
          this.$router.replace('/');
        });
    },
  },
});

export default store;
