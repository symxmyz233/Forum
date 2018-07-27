﻿// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

import * as React from 'react';
import * as Utility from '../Utility';
import { AppState, UserInfo } from '../States/AppState';
import * as $ from 'jquery';
import { connect } from 'react-redux';
import { Actions, RootState } from '../Store';
import { Link, withRouter, Route } from 'react-router-dom';
import { refreshCurrentUserInfo } from '../AsyncActions/UserCenter';
import { MessageInfo } from '../Reducers/Message';

type props = {
    isLogOn: boolean, 
    userInfo: UserInfo, 
    logOff: () => void, 
    reLogOn: (userInfo: UserInfo) => void,
    refreshUserInfo: () => void,
    messageCount: MessageInfo
}

type state = {
    hoverElement: string
}

class DropDownConnect extends React.Component<props, state> {   //顶部条的下拉菜单组件
    constructor(props) {
        super(props);
        this.state = ({
            hoverElement: null
        });
    }

    componentDidMount() {
        /**
         * 同步不同窗口的登陆信息
         */
        window.addEventListener('storage', (e) => {
            if(e.key === 'userInfo') {
                if(e.oldValue === e.newValue) return;
                if(e.newValue){ //如果用户在其他页面重新登陆
                    this.props.reLogOn(JSON.parse(e.newValue.slice(4)));
                }else { //如果用户在其他页面注销
                    this.props.logOff();
                }
            } 
        });

        //每天刷新一次用户信息
        if(Utility.isLogOn() && !Utility.getLocalStorage('shouldNotRefreshUserInfo')) {
            this.props.refreshUserInfo();
            Utility.setLocalStorage('shouldNotRefreshUserInfo', true, 86400);
        }
    }

    logOff() {
        this.handleMouseEvent('mouseout', "userName");
        Utility.removeLocalStorage("accessToken");
        Utility.removeLocalStorage("refresh_token");
        Utility.removeLocalStorage("userInfo");
        Utility.removeStorage("all");
        Utility.changeTheme(0);
        this.props.logOff();            //更新redux中的状态
    }

    handleMouseEvent(type, className) {
        switch (type) {
            case 'mouseover': {
                this.setState({
                    hoverElement: className
                });
                break;
            }
            case 'mouseout': {
                this.setState({
                    hoverElement: null
                });
                break;
            }
        }
    }

    render() {
        if (this.props.isLogOn) {
            const totalCount = this.props.messageCount.atCount +
                this.props.messageCount.messageCount +
                this.props.messageCount.replyCount + 
                this.props.messageCount.systemCount;

            const style = {
                display: 'block',
                transitionDuration: '.2s',
                height: '0px'
            };
            //全站管理选项
            let admin = this.props.userInfo.privilege === '管理员' ? <Link to="/sitemanage" style={{ color: '#fff' }}><li>全站管理</li></Link> : null;
            //用户中心下拉列表
            let userCenterClassName = "topBarUserCenter";
            if (location.pathname === "/") {
                userCenterClassName = "topBarUserCenter-mainPage";
            }
            //消息中心下拉列表
            let MessageClassName = "topBarMessageDetails";
            if (location.pathname === "/") {
                MessageClassName = "topBarMessageDetails-mainPage";
            }

            //获取签到状态
            let signinInfo = "签到";
            let userInfo = Utility.getLocalStorage("userInfo");
            if (Utility.getLocalStorage(`signin_${userInfo.id}`)) {
                signinInfo = "已签到";
            }
            return (<div className="topBarRight">
                <div className="topBarUserInfo">
                    <div
                        className="topBarMessage"
                        id="userMessage"
                        onMouseOut={(e) => { this.handleMouseEvent(e.type, 'message'); }}
                        onMouseOver={(e) => { this.handleMouseEvent(e.type, 'message'); }}
                    >
                        <Link to="/message/response" className="messageTopBar">
                            <div className="topBarBell"> <i className="fa fa-bell-o"></i></div>
                            {totalCount ? <div className="message-counter" id="unreadCount-totalCount">{totalCount}</div> : null}
                        </Link>
                    </div>
                    <div className="topBarUserImg"
                        onMouseOut={(e) => { this.handleMouseEvent(e.type, "userName"); }}
                        onMouseOver={(e) => { this.handleMouseEvent(e.type, "userName"); }}
                    >
                        <img src={this.props.userInfo.portraitUrl}></img>
                    </div>
                    <div
                        className="topBarUserName"
                        onMouseOut={(e) => { this.handleMouseEvent(e.type, "userName"); }}
                        onMouseOver={(e) => { this.handleMouseEvent(e.type, "userName"); }}
                    >
                        {this.props.userInfo.name}
                    </div>
                </div>
                <div
                    className={userCenterClassName}
                    onMouseOut={(e) => { this.handleMouseEvent(e.type, "userName"); }}
                    onMouseOver={(e) => { this.handleMouseEvent(e.type, "userName"); }}
                    style={{ ...style, overflow: 'hidden', height: this.state.hoverElement === 'userName' ? '8rem' : '0' }}
                >
                    <ul style={{ display: 'inherit' }}>
                        <Link to="/usercenter"> <li>个人中心</li></Link>
                        {admin}
                        <Link to="/signin"><li>{signinInfo}</li></Link>
                        <li onClick={this.logOff.bind(this)}>注销</li>
                    </ul>
                </div>
                <div
                    className={MessageClassName}
                    onMouseOut={(e) => { this.handleMouseEvent(e.type, "message"); }}
                    onMouseOver={(e) => { this.handleMouseEvent(e.type, "message"); }}
                    style={{ ...style, overflow: 'hidden', height: this.state.hoverElement === 'message' ? '8rem' : '0' }}
                >
                    <ul style={{ display: 'inherit' }}>
                        <Link to="/message/response"><li>回复我的{this.props.messageCount.replyCount ? <div className="message-counterLi">{this.props.messageCount.replyCount}</div> : null}</li></Link>
                        <Link to="/message/attme"><li>@ 我的{this.props.messageCount.atCount ? <div className="message-counterLi">{this.props.messageCount.atCount}</div> : null}</li></Link>
                        <Link to="/message/system"><li>系统通知{this.props.messageCount.systemCount ? <div className="message-counterLi">{this.props.messageCount.systemCount}</div> : null}</li></Link>
                        <Link to="/message/message"><li>我的私信{this.props.messageCount.messageCount ? <div className="message-counterLi">{this.props.messageCount.messageCount}</div> : null}</li></Link>
                    </ul>
                </div>
            </div>);
        }
        else {
            return <div className="topBarUserInfo">
                <div className="topBarText"> <Link to="/logOn">登录</Link></div>
                <div className="topBarText"><a href="https://account.cc98.org/">注册</a></div>
            </div>
        }
    }
}

// 这里是董松松的修改，加了redux
function mapState(state: RootState) {
    return {
        userInfo: state.userInfo.currentUserInfo,
        isLogOn: state.userInfo.isLogOn,
        messageCount: state.message
    }
}

function mapDispatch(dispatch) {
    return {
        logOff: () => {
            dispatch(Actions.userLogOff());
        },
        reLogOn: (newInfo: UserInfo) => {
            Utility.changeTheme(newInfo.theme);
            dispatch(Actions.changeUserInfo(newInfo));
            dispatch(Actions.userLogIn());
        },
        refreshUserInfo: () => {
            dispatch(refreshCurrentUserInfo());
        }
    };
}

let DropDown = connect(mapState, mapDispatch)(DropDownConnect);

//到此结束

export class SearchBeforeConnent extends React.Component<any, AppState> {     //搜索框组件

    async componentDidMount() {
        const searchBoxSelect = $('.searchBoxSelect');
        const downArrow = $('.caret-down');
        const searchBoxSub = $('.searchBoxSub');
        const searchIco = $('.searchIco');
        const searchBoxLi = searchBoxSub.find('li');

        $(document).click(function () {
            searchBoxSub.css('display', 'none');
        });

        searchBoxSelect.click(function () {
            if (searchBoxSub.css('display') === 'block') searchBoxSub.css('display', 'none');
            else searchBoxSub.css('display', 'block');
            return false;   //阻止事件冒泡
        });

        downArrow.click(function () {
            if (searchBoxSub.css('display') === 'block') searchBoxSub.css('display', 'none');
            else searchBoxSub.css('display', 'block');
            return false;   //阻止事件冒泡
        });

        /*在一个对象上触发某类事件（比如单击onclick事件），如果此对象定义了此事件的处理程序，那么此事件就会调用这个处理程序，
        如果没有定义此事件处理程序或者事件返回true，那么这个事件会向这个对象的父级对象传播，从里到外，直至它被处理（父级对象所有同类事件都将被激活），
        或者它到达了对象层次的最顶层，即document对象（有些浏览器是window）。*/

        searchBoxLi.click(function () {
            searchBoxSelect.text($(this).text());
        });

        searchBoxLi.mouseover(function () {
            this.className = 'hover';
        });

        searchBoxLi.mouseout(function () {
            this.className = '';
        });

        //获取搜索关键词
        let self = this;
        searchIco.click(async () => {
            let val: any = $('#searchText').val();
            if (val && val != '') {
                if (searchBoxSelect.text() === '主题' || searchBoxSelect.text() === '全站') {
                    this.props.history.push(`/search?boardId=0&keyword=${encodeURI(encodeURI(val))}`);
                }
                else if (searchBoxSelect.text() === '版内') {
                    //查看当前是全站还是某版，如果是某版就查询到某版id
                    let url1 = location.href.match(/\/topic\/(\d+)/);
                    let url2 = location.href.match(/\/list\/(\d+)/);
                    let url3 = location.href.match(/\/search\?boardId=(\d+)&/);
                    let boardId = 0;
                    if (url1) {
                        console.log("版内1");
                        let topicId = url1[1];
                        let response = await Utility.getTopicInfo(topicId);
                        boardId = response.boardId;
                    }
                    else if (url2) {
                        console.log("版内2");
                        boardId = parseInt(url2[1]);
                    }
                    else if (url3) {
                        boardId = parseInt(url3[1]);
                        console.log(url3);
                        console.log(url3[1]);
                        console.log("目前是在版内啊");
                    }
                    this.props.history.push(`/search?boardId=${boardId}&keyword=${encodeURI(encodeURI(val))}`);
                }
                else if (searchBoxSelect.text() === '用户') {
                    let data = await Utility.getUserInfoByName(val);
                    if (data) {
                        this.props.history.push(`/user/id/${data.id}`);
                    }
                    else {
                        this.props.history.push('/search');
                    }
                }
                else if (searchBoxSelect.text() === '版面') {
                    this.props.history.push(`/searchBoard?keyword=${encodeURI(encodeURI(val))}`);
                }
            }
        });
    }

    //回车搜索
    keypress_submit(e) {
        var evt = e || window.event;
        var code = evt.which || evt.keyCode || evt.charCode; //提高浏览器兼容性
        if (code === 13) {
            $('.searchIco').click();
        }
        else if (evt.key === 'Enter') { //提高浏览器兼容性
            $('.searchIco').click();
        }
    }

    render() {
        //查看当前是全站还是某版
        let url1 = location.href.match(/\/topic\/(\d+)/);
        let url2 = location.href.match(/\/list\/(\d+)/);
        let url3 = location.href.match(/\/(searchBoard)/);
        let url4 = location.href.match(/\/search\?boardId=(\d+)/);
        let flag = 1;
        if (url1) {
            flag = 0;
        }
        else if (url2) {
            flag = 0;
        }
        else if (url3) {
        }
        else if (url4 && parseInt(url4[1]) !== 0) {
            flag = 0;
        }

        if (flag) {
            return <div id="search">
                <div className="box">
                    <div className="searchBoxSelect">主题</div>
                    <div className="caret-down"><i className="fa fa-caret-down"></i></div>
                    <input id="searchText" type="text" placeholder="请输入搜索内容" onKeyPress={this.keypress_submit} />
                    <div className="searchIco"><i className="fa fa-search"></i></div>
                </div>
                <ul className="searchBoxSub">
                    <li>主题</li>
                    <li>用户</li>
                    <li>版面</li>
                    <li style={{ display: 'none' }}></li>
                </ul>
            </div>;
        }
        else {
            return <div id="search">
                <div className="box">
                    <div className="searchBoxSelect">版内</div>
                    <div className="caret-down"><i className="fa fa-caret-down"></i></div>
                    <input id="searchText" type="text" placeholder="请输入搜索内容" onKeyPress={this.keypress_submit} />
                    <div className="searchIco"><i className="fa fa-search"></i></div>
                </div>
                <ul className="searchBoxSub">
                    <li>版内</li>
                    <li>全站</li>
                    <li>用户</li>
                    <li>版面</li>
                </ul>
            </div>;
        }
    }
}

export const Search = withRouter(SearchBeforeConnent);

export class Header extends React.Component<{}, AppState> {

    render() {
        let pathname = location.pathname;
        if (pathname === "/") {
            return <div className="header">
                <div className="topBar-mainPage">
                    <div className="topBarRow">
                        <div className="row" style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                            <div className="topBarLogo"><Link to="/"><img src="/static/images/98LOGO.ico" /></Link></div>
                            <div className="topBarCC98"><Link to="/">CC98论坛</Link></div>
                            <div className="topBarText">|</div>
                            <div className="topBarText"><Link to="/boardList">版面列表</Link></div>
                            <div className="topBarText"><Link to="/newTopics">新帖</Link></div>
                            <div className="topBarText"><Link to="/focus">关注</Link></div>
                            <Route component={Search} />
                        </div>
                        <DropDown />
                    </div>
                </div>
            </div>;
        } else {
            return <div className="headerWithoutImage">
                <div className="topBar">
                    <div className="topBarRow">
                        <div className="row" style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                            <div className="topBarLogo"><Link to="/"><img src="/static/images/98LOGO.ico" /></Link></div>
                            <div className="topBarCC98"><Link to="/">CC98论坛</Link></div>
                            <div className="topBarText">|</div>
                            <div className="topBarText"><Link to="/boardList">版面列表</Link></div>
                            <div className="topBarText"><Link to="/newTopics">新帖</Link></div>
                            <div className="topBarText"><Link to="/focus">关注</Link></div>
                            <Route component={Search} />
                        </div>
                        <DropDown />
                    </div>
                </div>
            </div>;
        }
    }
}