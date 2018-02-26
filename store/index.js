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
      const newUserKey = usersRef.child('users').push().key;
      const newUser = {
        username: user.username,
        email: user.email,
        id: user.uid,
        key: newUserKey,
      };
      console.log(newUser);
      const updates = {};
      updates[newUserKey] = newUser;
      usersRef.update(updates);
    },
    SET_USER(context) {
      const user = firebase.auth().currentUser;
      context.commit('updateUser', user);
    },
    SIGN_IN(context, signInDetails) {
      firebase.auth().signInWithEmailAndPassword(signInDetails.email, signInDetails.password)
        .then(() => {
          context.commit('updateUser', true);
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
          context.dispatch('SET_USER', user);
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
