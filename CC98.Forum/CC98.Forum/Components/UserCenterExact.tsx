﻿// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from 'react';
import { UserInfo } from '../States/AppState';
import { UserCenterExactProfile } from './UserCenterExactProfile';
import { UserCenterExactActivities } from './UserCenterExactActivities';
import { UserCenterExactAvatar } from './UserCenterExactAvatar'

/**
 * 用户中心主页
 */
export class UserCenterExact extends React.Component<null, UserCenterExactState> {

    async componentDidMount() {
        console.log(location);
        console.log(location.hash !== '' && location.hash.indexOf('access_token') !== -1);
        if (location.hash !== '' && location.hash.indexOf('access_token') !== -1) {
            let hash: myType = {};
            location.hash.slice(1).split('&').map((item) => item.split('=')).forEach((item) => {
                hash[item[0]] = item[1];
            });
            window.localStorage.token = hash['access_token'];
        }

        let response = await fetch('https://api.cc98.org/Me/', {
            headers: {
                'Authorization': 'bearer' + ' ' + window.localStorage.token
            }
        });
        let data = await response.json();
        console.log(response);
        this.setState({
            userInfo: data,
            userAvatarImgURL: data.portraitUrl,
            responseState: response.status
        });
        console.log(this.state);
    }

    render() {
        let element;
        if (this.state !== null && this.state.responseState === 200) {
            element = (<div className='user-center-exact'>
                <UserCenterExactAvatar userAvatarImgURL={this.state.userAvatarImgURL} />
                <UserCenterExactProfile userInfo={this.state.userInfo} />
                <UserCenterExactActivities />
            </div>);
        } else if (this.state !== null && this.state.responseState === 401) {
            element = <p>请重新登陆</p>;
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

interface myType {
    [name: string]: string;
}