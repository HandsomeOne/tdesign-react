import React, { ReactElement, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import throttle from 'lodash/throttle';
import { ChevronRightIcon as TdIconChevronRight, ChevronLeftIcon as TdIconChevronLeft } from 'tdesign-icons-react';
import useConfig from '../hooks/useConfig';
import { DropdownProps } from './Dropdown';
import TDivider from '../divider';
import DropdownItem from './DropdownItem';
import { DropdownOption } from './type';
import useGlobalIcon from '../hooks/useGlobalIcon';

const DropdownMenu: React.FC<DropdownProps> = (props) => {
  const { options = [], maxHeight = 300, minColumnWidth = 10, maxColumnWidth = 160, direction } = props;

  const { classPrefix } = useConfig();
  const dropdownClass = `${classPrefix}-dropdown`;
  const dropdownMenuClass = `${dropdownClass}__menu`;

  const { ChevronRightIcon, ChevronLeftIcon } = useGlobalIcon({
    ChevronRightIcon: TdIconChevronRight,
    ChevronLeftIcon: TdIconChevronLeft,
  });

  const menuRef = useRef<HTMLDivElement>();
  const [isOverMaxHeight, setIsOverMaxHeight] = useState(false);
  const [calcScrollTopMap, setScrollTopMap] = useState({});

  useEffect(() => {
    if (menuRef.current) {
      const menuHeight = menuRef.current.childNodes?.length * 30;

      if (menuHeight >= maxHeight) setIsOverMaxHeight(true);
    }
  }, [maxHeight]);

  const handleItemClick = (options: {
    data: DropdownOption;
    context: { e: React.MouseEvent<HTMLDivElement, MouseEvent> };
  }) => {
    const { data, context } = options;
    data?.onClick?.(data, context);
    props.onClick?.(data, context);
  };

  const handleScroll = (e: React.MouseEvent<HTMLDivElement>, deep = 0) => {
    const { scrollTop } = e.target as HTMLElement;
    setScrollTopMap({ ...calcScrollTopMap, [deep]: scrollTop });
  };

  const throttleUpdate = throttle(handleScroll, 100);

  // 处理options渲染的场景
  const renderOptions = (data: Array<DropdownOption | React.ReactChild>, deep: number) => {
    const arr = [];
    let renderContent: ReactElement;
    data.forEach?.((menu, idx) => {
      const optionItem = { ...(menu as DropdownOption) };
      const onViewIdx = Math.ceil(calcScrollTopMap[deep] / 30);
      const itemIdx = idx >= onViewIdx ? idx - onViewIdx : idx;
      if (optionItem.children) {
        optionItem.children = renderOptions(optionItem.children, deep + 1);
        renderContent = (
          <div key={idx}>
            <DropdownItem
              className={classNames(optionItem.className, `${dropdownClass}__item`, `${dropdownClass}__item--suffix`)}
              style={optionItem.style}
              value={optionItem.value}
              theme={optionItem.theme}
              active={optionItem.active}
              prefixIcon={optionItem.prefixIcon}
              disabled={optionItem.disabled}
              minColumnWidth={minColumnWidth}
              maxColumnWidth={maxColumnWidth}
              isSubmenu={true}
            >
              <div className={`${dropdownClass}__item-content`}>
                {direction === 'right' ? (
                  <>
                    <span className={`${dropdownClass}__item-text`}>{optionItem.content}</span>
                    <ChevronRightIcon className={`${dropdownClass}__item-direction`} size="16" />
                  </>
                ) : (
                  <>
                    <ChevronLeftIcon className={`${dropdownClass}__item-direction`} size="16" />
                    <span className={`${dropdownClass}__item-text`}>{optionItem.content}</span>
                  </>
                )}
              </div>
              <div
                className={classNames(`${dropdownClass}__submenu-wrapper`, {
                  [`${dropdownClass}__submenu-wrapper--${props.direction}`]: props.direction,
                })}
                style={{
                  position: 'absolute',
                  top: `${itemIdx * 30}px`,
                }}
              >
                <div
                  className={classNames(`${dropdownClass}__submenu`, {
                    [`${dropdownClass}__submenu--disabled`]: optionItem.disabled,
                  })}
                  style={{
                    position: 'static',
                    maxHeight: `${props.maxHeight}px`,
                  }}
                  onScroll={(e: React.MouseEvent<HTMLDivElement>) => handleScroll(e, deep + 1)}
                >
                  <ul>{optionItem.children as React.ReactNode}</ul>
                </div>
              </div>
            </DropdownItem>
            {optionItem.divider ? <TDivider /> : null}
          </div>
        );
      } else {
        renderContent = (
          <div key={idx}>
            <DropdownItem
              className={classNames(optionItem.className, `${dropdownClass}__item`)}
              style={optionItem.style}
              value={optionItem.value}
              theme={optionItem.theme}
              active={optionItem.active}
              prefixIcon={optionItem.prefixIcon}
              disabled={optionItem.disabled}
              minColumnWidth={minColumnWidth}
              maxColumnWidth={maxColumnWidth}
              onClick={
                optionItem.disabled || optionItem.children
                  ? () => null
                  : (
                      value: string | number | { [key: string]: any },
                      context: { e: React.MouseEvent<HTMLDivElement, MouseEvent> },
                    ) => handleItemClick({ data: optionItem, context })
              }
            >
              <span className={`${dropdownClass}__item-text`}>{optionItem.content}</span>
            </DropdownItem>
            {optionItem.divider ? <TDivider /> : null}
          </div>
        );
      }
      arr.push(renderContent);
    });
    return arr;
  };

  return (
    <div
      className={classNames(dropdownMenuClass, `${dropdownMenuClass}--${direction}`, {
        [`${dropdownMenuClass}--overflow`]: isOverMaxHeight,
      })}
      style={{
        maxHeight: `${maxHeight}px`,
      }}
      ref={menuRef}
      onScroll={throttleUpdate}
    >
      {renderOptions(options, 0)}
    </div>
  );
};

DropdownMenu.displayName = 'DropdownMenu';

export default DropdownMenu;
