/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyAction = Action;

type AnyState = any;

type Reducer<S = AnyState, A extends Action = AnyAction> = (state: S | undefined, action: A) => S;

type TCounterState = {
  count: number;
};

type TDispatch<A extends Action = AnyAction> = (action: A) => any;

type TEnhancer<S = AnyState, A extends Action = AnyAction> = (
  storeCreator: StoreCreator
) => TEnhancerResult<S, A>;

type TEnhancerResult<S = AnyState, A extends Action = AnyAction> = (
  reducer: Reducer<S, A>,
  state?: S
) => Store<S, A>;

type TEnhancerTuple = [Reducer, AnyState];

type TMiddleware<S = AnyState, A extends Action = AnyAction> = (
  state: SimpleStore<S, A>
) => (next: TDispatch<A>) => TDispatch<A>;

interface Action<T = any> {
  type: T;
}

interface SimpleStore<S = AnyState, A extends Action = AnyAction> {
  dispatch(action: A): any;
  getState(): S;
}

interface Store<S = AnyState, A extends Action = AnyAction> extends SimpleStore {
  subscribe(listener: () => any): Unsubscribe;
}

interface StoreCreator {
  <S, A extends Action>(reducer: Reducer<S, A>, preloadedState?: S, enhancer?: any): Store<S, A>;
}

interface Unsubscribe {
  (): void;
}

export {
  Action,
  AnyAction,
  AnyState,
  TEnhancer,
  TDispatch,
  Reducer,
  TCounterState,
  TEnhancerTuple,
  TMiddleware,
  Unsubscribe,
  SimpleStore,
  Store,
  StoreCreator
};
