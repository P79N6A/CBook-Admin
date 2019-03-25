import { queryGoodDetail, updateGood } from '@/services/api';

export default {
  namespace: 'goodDetail',

  state: {
    data: {}
  },

  effects: {
    *fetch({ payload, callback }, { call, put }) {
      const response = yield call(queryGoodDetail, payload);
      if (response === undefined) return;
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *update({ payload, callback }, { call, put, select }) {
      const response = yield call(updateGood, payload);
      const data = yield select(state => state.bookDetail.data);
      if (response === undefined) return;
      yield put({
        type: 'save',
        payload: {...data, ...payload, imags: payload.imags.split('|')},
      });
      if (callback) callback();
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
