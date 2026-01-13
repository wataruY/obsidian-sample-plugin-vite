'use client'
import React from 'react'
import { useState } from 'react';
import { useMultiSelect, multiSelect } from '@szhsin/react-autocomplete';
import { Key } from 'lucide-react';


interface MultiSelectProps {
  items: string[]
}

const MultiSelect = ({ items }: MultiSelectProps) => {
  const [value, setValue] = useState<string>();
  // You can set a few items to be selected initially
  const [selected, setSelected] = useState<string[]>(['Alaska', 'Florida']);
  // It's up to you how to filter items based on the input value
  const candidates = value
    ? items.filter((item) => item.toLowerCase().startsWith(value.toLowerCase()))
    : items;

  const {
    getLabelProps,
    getFocusCaptureProps,
    getInputProps,
    getClearProps,
    getToggleProps,
    getListProps,
    getItemProps,
    removeSelect,
    isItemSelected,
    isInputActive,
    isTagActive,
    focused,
    open,
    focusIndex,
    isInputEmpty
  } = useMultiSelect({
    // flipOnSelect: true or false,
    items: candidates,
    value,
    onChange: setValue,
    selected,
    onSelectChange: setSelected,
    feature: multiSelect({
      // Options: rovingText, closeOnSelect
      rovingText: true
    })
  });
  console.log(Object.keys(getInputProps))

  return (
    <div>
      <label {...getLabelProps()} {...getFocusCaptureProps()}>
        State
      </label>
      <div
        {...getFocusCaptureProps()}
        style={{
          border: '2px solid',
          borderColor: focused ? '#007bff' : '#aaa',
          borderRadius: 4,
          display: 'flex',
          flexWrap: 'wrap',
          maxWidth: 320,
          gap: 6,
          padding: 6
        }}
      >
        {selected.map((tag) => (
          <button
            key={tag}
            onClick={() => removeSelect(tag)}
            // Highlight the active tag that can be removed with the Backspace key
            style={{ color: isTagActive(tag) ? 'red' : 'initial' }}
          >
            {tag}
          </button>
        ))}
        <div>
          <input
            placeholder="Type..."
            {...getInputProps()}
            style={{ caretColor: isInputActive ? 'auto' : 'transparent' }}
            onKeyDown={(event) => {

              // TODO: re-send keyboard event to list-box-andidates
              if (event.key === "ArrowDown") {
                const el = document.querySelector('#list-box-candidates')
                console.log(el)
                el?.dispatchEvent(new KeyboardEvent('keydown', {
                  key: event.key,
                }))
              }

            }}
          />
          {!isInputEmpty && <button {...getClearProps()}>X</button>}
        </div>
        <button {...getToggleProps()}>{open ? '↑' : '↓'}</button>
      </div>

      <ul
        {...getListProps()}
        style={{
          display: open ? 'block' : 'none',
          position: 'absolute',
          listStyle: 'none',
          overflow: 'auto',
          maxHeight: 300,
          margin: 0,
          padding: 0
        }}
        id="list-box-candidates"
      >
        {items.length ? (
          items.map((item, index) => (
            <li
              style={{
                background: focusIndex === index ? '#ddd' : 'none'
              }}
              key={item}
              {...getItemProps({ item, index })}
            >
              {item}
              {isItemSelected(item) && '✔️'}
            </li>
          ))
        ) : (
          <li>No options</li>
        )}
      </ul>
    </div>
  );
};

export default MultiSelect;
