import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import type {RootStates, AppDispatch} from './store';

// 在整个应用程序中使用，而不是简单的 `useDispatch` 和 `useSelector`
type UseAppDispatch = () => AppDispatch
export const useAppDispatch: UseAppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootStates> = useSelector;
