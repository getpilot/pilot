"use client";
import clsx from "clsx";
import type React from "react";

import { useRef, useState, useEffect } from "react";
import { Button } from "@pilot/ui/components/button";

type InputForm = {
  formAction?: (
    data: FormData
  ) => Promise<{ success: true } | { success: false; error: string }>;
  buttonCopy: {
    success: string;
    idle: string;
    loading: string;
  };
};

type State = "idle" | "loading" | "success" | "error";

const STATES: Record<State, State> = {
  idle: "idle",
  loading: "loading",
  success: "success",
  error: "error",
};

export function InputForm({ formAction, buttonCopy }: InputForm) {
  const [state, setState] = useState<State>(STATES.idle);
  const [error, setError] = useState<string>();
  const [emailValue, setEmailValue] = useState("");
  const [nameValue, setNameValue] = useState("");
  const errorTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (state === STATES.success) {
      const resetTimeout = window.setTimeout(() => {
        setState(STATES.idle);
      }, 2000);

      return () => window.clearTimeout(resetTimeout);
    }
  }, [state]);

  useEffect(() => {
    return () => {
      if (errorTimeout.current !== null) {
        window.clearTimeout(errorTimeout.current);
        errorTimeout.current = null;
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    if (state === STATES.success || state === STATES.loading) return;
    if (errorTimeout.current) {
      window.clearTimeout(errorTimeout.current);
      setError(undefined);
      setState(STATES.idle);
    }
    if (formAction && typeof formAction === "function") {
      try {
        setState(STATES.loading);
        const data = await formAction(new FormData(formEl));

        if (data.success) {
          setState(STATES.success);

          formEl.reset();
          setEmailValue("");
          setNameValue("");
        } else {
          setState(STATES.error);
          setError(data.error);
          errorTimeout.current = window.setTimeout(() => {
            setError(undefined);
            setState(STATES.idle);
          }, 3000);
        }
      } catch (error) {
        setState(STATES.error);
        setError("There was an error while submitting the form");
        console.error(error);
        errorTimeout.current = window.setTimeout(() => {
          setError(undefined);
          setState(STATES.idle);
        }, 3000);
      }
    }
  };
  const isSubmitted = state === "success";
  const inputDisabled = state === "loading";

  return (
    <form
      className="flex flex-col gap-3 w-full relative"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-2">
        <input
          name="name"
          value={nameValue}
          className={clsx(
            "w-full text-sm px-4 py-2 h-11 bg-background cursor-text rounded-full text-foreground placeholder:text-muted-foreground border border-border"
          )}
          placeholder="Your name"
          disabled={inputDisabled}
          onChange={(e) => setNameValue(e.target.value)}
          autoComplete="name"
          data-1p-ignore
          data-lpignore
          required
        />
        <input
          name="email"
          value={emailValue}
          className={clsx(
            "w-full text-sm px-4 py-2 h-11 bg-background cursor-text rounded-full text-foreground placeholder:text-muted-foreground border border-border"
          )}
          placeholder="Your email"
          type="email"
          disabled={inputDisabled}
          onChange={(e) => setEmailValue(e.target.value)}
          autoComplete="email"
          data-1p-ignore
          data-lpignore
          required
        />
        <Button
          type="submit"
          disabled={inputDisabled}
          className={clsx(
            "w-full h-9 mt-1 rounded-full font-medium flex gap-1 items-center text-sm",
            inputDisabled && "cursor-not-allowed bg-muted",
            state === "loading"
              ? "bg-muted text-muted-foreground"
              : "bg-primary text-white"
          )}
        >
          {state === "loading" ? (
            <div className="flex flex-row gap-2">
              {buttonCopy.loading}
              <Loading />
            </div>
          ) : isSubmitted ? (
            buttonCopy.success
          ) : (
            buttonCopy.idle
          )}
        </Button>
      </div>
      <div className="w-full h-2" />
      {error && (
        <p className="absolute text-xs text-destructive top-full -translate-y-1/2 px-2">
          {error}
        </p>
      )}
    </form>
  );
}

const Loading = () => (
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 rounded-full border-2 border-[currentColor] !border-t-[transparent] animate-spin" />
  </div>
);
