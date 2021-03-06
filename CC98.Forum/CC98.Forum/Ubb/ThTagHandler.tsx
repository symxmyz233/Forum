﻿// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from 'react';
import * as Ubb from './Core';

/**
 * 处理 [th] 标签的处理器。
 */
export class ThTagHandler extends Ubb.RecursiveTagHandler {

    get supportedTagNames(): string { return 'th' };

    execCore(innerContent: React.ReactNode, tagData: Ubb.UbbTagData, context: Ubb.UbbCodeContext): React.ReactNode {

        let rowspanValue = 1;
        let colspanValue = 1;
        if (tagData.parameterCount === 2) {
            rowspanValue = parseInt(tagData.value(0));
            colspanValue = parseInt(tagData.value(1));
        }
        return <th rowSpan={rowspanValue} colSpan={colspanValue}>{innerContent}</th>;
    }
}