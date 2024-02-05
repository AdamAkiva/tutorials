import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction
} from 'react';
import ReactDOM from 'react-dom/client';

/**********************************************************************************/

export type UnknownObject = { [key: string]: unknown };
export type Maybe<T> = T | undefined;
export type MaybeArray<T> = T | T[];

export type Optional<T, K extends keyof T> = Omit<T, K> & Pick<Partial<T>, K>;
export type RequiredFields<T, K extends keyof T> = Required<Pick<T, K>> & T;

export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

/**********************************************************************************/

export {
  React,
  ReactDOM,
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction
};
