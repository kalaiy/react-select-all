import React, { useRef } from 'react';
import {
  Options,
  components,
  ValueContainerProps,
  PlaceholderProps,
  ActionMeta,
  GroupBase,
  Props,
  OptionsOrGroups,
  SelectInstance,
  OnChangeValue,
} from 'react-select';
import ReactSelect from 'react-select';
import { Tooltip } from 'react-tooltip';
import nextId from 'react-id-generator';
import * as lodash from 'lodash';

function CustomValueContainer<Option>({
  children,

  ...props
}: ValueContainerProps<Option>) {
  // console.log(props);
  const {
    getValue,
    hasValue,
    isMulti,
    selectProps: { placeholder, inputValue },
  } = props;
  const numberOfValues = getValue().length;

  const value = getValue();
  const child = children as Array<React.ReactElement>;
  debugger;
  if (!hasValue || !isMulti) {
    return (
      <components.ValueContainer {...props}>
        {children}
      </components.ValueContainer>
    );
  }
  return (
    <components.ValueContainer {...props}>
      {!inputValue && (
        <div style={{ backgroundColor: '#EAEAEA', padding: '.15rem' }}>
          {numberOfValues == 1 &&
          props.selectProps.getOptionLabel(value[0]) === 'All'
            ? 'All'
            : `${numberOfValues} Selected`}
        </div>
      )}
      {child.length > 0 && child[1]}
    </components.ValueContainer>
  );
}
export interface LabelValueProps {
  OptionLabel: string;
  ValueLabel: string;
  SelectAllText?: string;
}
export interface CProps<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
> extends Props<Option, IsMulti, Group>,
    LabelValueProps {}
function ReactMultiSelect<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
>(props: CProps<Option, IsMulti, Group>) {
  // isOptionSelected sees previous props.value after onChange
  const { SelectAllText = 'All' } = props;
  const htmlId = nextId('tip-');
  const labelMap = props.OptionLabel;

  const valueMap = props.ValueLabel;
  const valueRef = useRef<Options<Option>>(props.value as Options<Option>);
  const v = props.value as Options<Option>;
  valueRef.current = v;
  const inputRef = useRef<SelectInstance<Option, true> | null>(null);
  interface OptionType {
    [key: string]: any;
  }
  let selectAllOption = {} as OptionType;

  if (labelMap && valueMap) {
    selectAllOption[labelMap] = SelectAllText;
    selectAllOption[valueMap] = '-';
  }
  //console.log(htmlId);
  const maxToolTipCount = 7;
  const tiptext = (v.length > maxToolTipCount ? v.slice(0, maxToolTipCount) : v)
    .map((o) => `<div>${lodash.get(o, labelMap)}</div>`)
    .join('');

  const isSelectAllSelected = () =>
    valueRef.current.length === props.options?.length;

  const isOptionSelected = (option: Option, selectValue: Options<Option>) =>
    valueRef.current.some(
      (value) => lodash.get(value, valueMap) === lodash.get(option, valueMap)
    ) || isSelectAllSelected();

  const getOptions = () =>
    props.options &&
    ([selectAllOption as Option, ...props.options] as OptionsOrGroups<
      Option,
      Group
    >);

  const getValue = () =>
    isSelectAllSelected() ? ([selectAllOption] as Option[]) : v;

  const onChange = (
    newValue: ReadonlyArray<Option>,
    actionMeta: ActionMeta<Option>
  ) => {
    const { action, option, removedValue } = actionMeta;

    if (
      action === 'select-option' &&
      lodash.get(option, valueMap) === selectAllOption[valueMap]
    ) {
      props.onChange &&
        props.onChange(
          props.options as OnChangeValue<Option, IsMulti>,
          actionMeta
        );
    } else if (
      (action === 'deselect-option' &&
        lodash.get(option, valueMap) === selectAllOption[valueMap]) ||
      (action === 'remove-value' &&
        lodash.get(removedValue, valueMap) === selectAllOption[valueMap])
    ) {
      props.onChange &&
        props.onChange([] as OnChangeValue<Option, IsMulti>, actionMeta);
      // if (inputRef.current) {
      //   console.log(inputRef.current);
      //   inputRef.current.onMenuClose();
      //   inputRef.current.focus();
      // }
    } else if (
      actionMeta.action === 'deselect-option' &&
      lodash.get(option, labelMap) !== selectAllOption[labelMap]
    ) {
      props.onChange &&
        props.onChange(
          props.options?.filter(
            (value) =>
              lodash.get(value, valueMap) === lodash.get(option, valueMap) &&
              lodash.get(value, labelMap) === lodash.get(option, labelMap)
          ) as OnChangeValue<Option, IsMulti>,
          actionMeta
        );
    } else if (
      actionMeta.action === 'deselect-option' &&
      isSelectAllSelected()
    ) {
      props.onChange &&
        props.onChange(
          props.options?.filter(
            (value) =>
              lodash.get(value, valueMap) !== lodash.get(option, valueMap)
          ) as OnChangeValue<Option, IsMulti>,
          actionMeta
        );
    } else {
      props.onChange &&
        props.onChange(
          (newValue || []) as OnChangeValue<Option, IsMulti>,
          actionMeta
        );
    }
  };
  const closeMenu = React.useCallback(() => {
    debugger;
    if (inputRef.current) {
      inputRef.current.onMenuClose();
    }
  }, [inputRef.current]);

  return (
    <div tabIndex={0} onBlur={closeMenu}>
      {v.length > 0 && (
        <Tooltip
          anchorSelect={'#' + htmlId}
          style={{ zIndex: '1000' }}
          html={
            v.length > maxToolTipCount ? tiptext + '<span>...</span>' : tiptext
          }
        />
      )}
      <div id={htmlId}>
        <ReactSelect<Option, true>
          ref={inputRef}
          styles={{
            control: (base) => ({
              ...base,
              borderColor: 'hsl(0, 0%, 80%)',
              cursor: 'pointer',
            }),
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          }}
          isOptionSelected={isOptionSelected}
          options={getOptions()}
          value={getValue()}
          onChange={onChange}
          hideSelectedOptions={false}
          closeMenuOnSelect={false}
          getOptionLabel={props.getOptionLabel}
          getOptionValue={props.getOptionValue}
          isMulti
          placeholder={props.placeholder}
          components={{ ValueContainer: CustomValueContainer }}
          onBlur={(e) => closeMenu()}
        />
      </div>
    </div>
  );
}

export default ReactMultiSelect;
