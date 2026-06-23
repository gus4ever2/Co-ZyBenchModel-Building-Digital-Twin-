import { useState, createContext, useContext, useEffect, useRef } from "react";
import axios from 'axios';

export default function ActionButtons({ type, url, id, setReload }) {

    // Find Token
    const token = localStorage.getItem("token");

    const onCreate = async () => {

        const response = await axios.post(
            url + "create",
            null,
            {
                params: {
                    type: type
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        setReload(true);

    };

    const onDuplicate = async () => {

        const response = await axios.post(
            url + "duplicate",
            null,
            {
                params: {
                    id: id.current,
                    type: type
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        setReload(true);

    };

    const onDelete = async () => {

         await axios.delete(
            url + "delete",
            {
            params: {
                id: id.current,
            },
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            }
        );

        id.current = "0";

        setReload(true);

    };

    const buttonClass = `
      flex h-8 w-8 items-center justify-center rounded-full
      bg-blue-600 font-semibold leading-none text-white shadow-sm
      transition hover:bg-blue-700 active:scale-95
      focus:outline-none focus:ring-2 focus:ring-blue-300
    `;

    const iconClass = `
      flex h-full w-full items-center justify-center
      font-semibold leading-none
    `;


  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-gray-300 pt-3">
      <button
        type="button"
        onClick={onCreate}
        className={buttonClass}
      >
        <span className={`${iconClass} text-[18px] -translate-y-[1px]`}>
          +
        </span>
      </button>

      <button
        type="button"
        onClick={onDuplicate}
        className={buttonClass}
      >
        <span className={`${iconClass} text-[11px] -translate-y-[0.5px]`}>
          x2
        </span>
      </button>

      <button
        type="button"
        onClick={onDelete}
        className={buttonClass}
      >
        <span className={`${iconClass} text-[20px] -translate-y-[1px]`}>
          ×
        </span>
      </button>
    </div>
  );
}
