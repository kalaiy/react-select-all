import React, { useState } from 'react';
import './style.css';
import ReactMultiSelect from './multi-select';
import { ActionMeta } from 'react-select';
export type DropdownItem = {
  name: string;
  id: string;
};
export default function App() {
  const [selectedItem, setItem] = useState<ReadonlyArray<DropdownItem>>([]);
  const data: DropdownItem[] = [
    { id: '1', name: 'kalai' },
    { id: '2', name: 'divya' },
    { id: '3', name: 'kiran' },
  ];
  return (
    <div>
      <h1>React Select All </h1>
      <ReactMultiSelect<DropdownItem, true>
        id="category"
        isMulti
        value={selectedItem}
        //styles={defaultSelectStyle}
        closeMenuOnSelect={false}
        onChange={(
          value: ReadonlyArray<DropdownItem>,
          meta: ActionMeta<DropdownItem>
        ) => {
          setItem(value);
        }}
        getOptionLabel={(e) => e.name}
        getOptionValue={(e) => e.id}
        OptionLabel="name"
        ValueLabel="id"
        options={data}
      />
      <h3>
        {' '}
        Ping me if you have any queries https://github.com/kalaiy or
        kalaiy2kalaiy@gmail.com
      </h3>
    </div>
  );
}
