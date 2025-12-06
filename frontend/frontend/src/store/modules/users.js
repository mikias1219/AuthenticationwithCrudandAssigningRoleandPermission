import { api } from '../../api/api'

export default {
  namespaced: true,
  
  state: () => ({
    users: [],
    loading: false,
    error: null
  }),
  
  mutations: {
    SET_USERS(state, users) {
      state.users = users
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    ADD_USER(state, user) {
      state.users.push(user)
    },
    UPDATE_USER(state, updatedUser) {
      const index = state.users.findIndex(u => u.id === updatedUser.id)
      if (index !== -1) {
        state.users.splice(index, 1, updatedUser)
      }
    },
    REMOVE_USER(state, id) {
      state.users = state.users.filter(u => u.id !== id)
    }
  },
  
  actions: {
    async fetchUsers({ commit }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await api.get('/users')
        commit('SET_USERS', response.data)
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Failed to fetch users')
        console.error('Error fetching users:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createUser({ commit }, userData) {
      commit('SET_ERROR', null)
      
      try {
        const response = await api.post('/users', userData)
        commit('ADD_USER', response.data)
        return response.data
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Failed to create user'
        commit('SET_ERROR', errorMsg)
        throw new Error(errorMsg)
      }
    },
    
    async updateUser({ commit }, { id, ...userData }) {
      commit('SET_ERROR', null)
      
      try {
        const response = await api.put(`/users/${id}`, userData)
        commit('UPDATE_USER', response.data)
        return response.data
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Failed to update user'
        commit('SET_ERROR', errorMsg)
        throw new Error(errorMsg)
      }
    },
    
    async deleteUser({ commit }, id) {
      commit('SET_ERROR', null)
      
      try {
        await api.delete(`/users/${id}`)
        commit('REMOVE_USER', id)
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Failed to delete user'
        commit('SET_ERROR', errorMsg)
        throw new Error(errorMsg)
      }
    }
  }
}