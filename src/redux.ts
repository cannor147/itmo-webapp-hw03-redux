import {
  Action,
  AnyState,
  Reducer,
  SimpleStore,
  Store,
  StoreCreator,
  TDispatch,
  TEnhancer,
  TMiddleware,
  Unsubscribe
} from './types';

const createStore: StoreCreator = <S, A extends Action>(
  reducer: Reducer<S, A>,
  initialState?: S | TEnhancer<S, A>,
  enhancer?: TEnhancer<S, A>
): Store => {
  if (typeof reducer !== 'function') {
    throw new Error('Reducer should be a function.');
  }

  if (typeof enhancer === 'undefined' && typeof initialState === 'function') {
    return createStore(reducer, undefined, initialState);
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Enhancer should be a function.');
    }

    return enhancer(createStore)(reducer, initialState as S);
  }

  const subscriptions = new Map<number, () => void | undefined>();
  let subscriptionIndex = 0;
  let state: AnyState = initialState;
  if (typeof state === 'undefined') {
    state = reducer(undefined, { type: undefined } as A);
  }

  return {
    dispatch: (action: A): void => {
      if (typeof action.type === 'undefined') {
        throw new Error('Actions may not have an undefined "type" property.');
      }

      state = reducer(state, action);
      for (const listener of [...subscriptions.values()]) {
        listener();
      }
    },
    getState: (): A => state,
    subscribe(listener: () => void): Unsubscribe {
      if (typeof listener !== 'function') {
        throw new TypeError('Listener should be a function.');
      }

      const currentIndex = subscriptionIndex++;
      subscriptions.set(currentIndex, listener);

      return (): void => {
        if (subscriptions.has(currentIndex)) {
          subscriptions.delete(currentIndex);
        }
      };
    }
  };
};

const applyMiddleware = <S, A extends Action>(
  ...middlewares: TMiddleware<S, A>[]
): TEnhancer<S, A> => (storeCreator: StoreCreator) => (
  reducer: Reducer<S, A>,
  initialState?: S
): Store<S, A> => {
  let dispatch: TDispatch<A> = (): void => {
    throw new Error('It is prohibited to dispatch during the middleware setup.');
  };

  const store: Store<S, A> = storeCreator(reducer, initialState);
  const fakeStore: SimpleStore<S, A> = {
    dispatch: (action: A): void => dispatch(action),
    getState: () => store.getState()
  };

  dispatch = middlewares
    .map(middleware => middleware(fakeStore))
    .reduce((a, b) => (lol: TDispatch<A>): TDispatch<A> => a(b(lol)))(store.dispatch);

  return { ...store, dispatch };
};

export { createStore, applyMiddleware };
