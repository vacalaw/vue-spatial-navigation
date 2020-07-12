import { TYPES } from "../mutationTypes";

export default {
  [TYPES.HOME](state) {
    state.home = {
      loading: true,
    };
  },
  [TYPES.HOME_SUCCESS](state, payload) {
    state.home = {
      data: payload,
    };
  },
  [TYPES.HOME_ERROR](state, payload) {
    state.home = {
      error: payload,
    };
  },
};