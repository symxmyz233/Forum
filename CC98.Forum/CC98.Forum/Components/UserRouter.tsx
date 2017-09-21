﻿// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from 'react';
import {
    Route
} from 'react-router-dom';
import { UserInfo } from '../States/AppState';
import { UserCenterExactProfile } from './UserCenterExactProfile';
import { UserCenterExactActivities } from './UserCenterExactActivities';
import { UserCenterExactAvatar } from './UserCenterExactAvatar'

export class UserRouter extends React.Component {
    render() {
        return (<div className='user-center-router'>
            <Route path='/user/' component={UserExact} />
        </div>);
    }
}

class UserExact extends React.Component<null, UserCenterExactState> {

    async componentDidMount() {
        let response;
        if (!location.pathname.split('/')[2]) {
            return 0;
        } 
        if(location.pathname.split('/')[2] === 'name') {
            response = await fetch(`https://api.cc98.org/User/Name/${location.pathname.split('/')[3]}`);
        } else {
            response = await fetch(`https://api.cc98.org/User/${location.pathname.split('/')[2]}`);
        }
        let data = await response.json();
        this.setState({
            userInfo: data,
            userAvatarImgURL: data.portraitUrl,
            responseState: response.status
        });
    }

    render() {
        let element;
        if (this.state !== null && this.state.responseState === 200) {
            element = (<div className='user-center-exact'>
                <UserCenterExactAvatar userAvatarImgURL={this.state.userAvatarImgURL} />
                <UserCenterExactProfile userInfo={this.state.userInfo} />
                <UserCenterExactActivities />
            </div>);
        } else {
            element = <p>加载中</p>;
        }
        return element;
    }
}

interface UserCenterExactState {
    /**
    * 用户信息
    */
    userInfo: UserInfo;
    /**
    * 用户头像链接地址
    */
    userAvatarImgURL: string;
    /**
    * 加载状态
    */
    responseState: number;
}