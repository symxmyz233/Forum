﻿// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
import * as React from 'react';
import { MessageMessageState } from '../States/MessageMessageState';
import { MessagePersonInfo } from '../Props/MessagePersonInfo';
import { MessagePerson } from './MessagePerson';
import { MessageWindow } from './MessageWindow';
import * as Utility from '../Utility';

/**
 * 我的私信，包括最近联系人列表和聊天窗口两个组件
 */
export class MessageMessage extends React.Component<{}, MessageMessageState> {

    constructor(props) {
        super(props);
        this.state = {
            data: null,
            chatObj: null
        };
        //如果没有设置默认的state，render第一次渲染的时候state为空，MessageWindow组件会报错
        this.getMoreContact = this.getMoreContact.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    async componentDidMount() {
        let token = Utility.getLocalStorage("accessToken");
        console.log(`进入消息开始时的token`);

        //获取到本人信息
        let myInfo = Utility.getLocalStorage("userInfo");

        //创建一个数组存储联系人信息
        let recentContact = Utility.getStorage("recentContact");
        if (!recentContact) {
            recentContact = await Utility.getRecentContact(0, 7, this.context.router);
            Utility.setStorage("recentContact", recentContact);
        }

        //对联系人列表重新排序，看是否有从其他页面发起的聊天
        recentContact = await Utility.sortContactList(recentContact, this.context.router);

        console.log("走远第一步");
        console.log(recentContact);

        if (recentContact) {
            //默认第一个人为聊天对象
            this.setState({ data: recentContact, chatObj: recentContact[0] });
        }
        //默认选中第一个联系人
        let chatObj = this.state.chatObj
        $(`#${chatObj.name}`).addClass('message-message-pFocus');
    }

    //对this.stata.data进行批量化转化为JSX的函数，每个JSX可点击改变state里聊天对象的信息
    coverMessagePerson = (item: MessagePersonInfo) => {
        const changeChatName = () => {
            this.setState({ chatObj: item });
		    //给选中的聊天对象添加选中效果
		    $('.message-message-pList > div').removeClass('message-message-pFocus');
		    $(`#${item.name}`).addClass('message-message-pFocus');
        };
        return <div onClick={changeChatName} id={`${item.name}`}><MessagePerson data={item} /></div>;
    };

    /**
    *点击获取更多联系人
    */
    async getMoreContact() {
        if ($('#moreDone').css('display') == 'none') {
            $('#moreImg').removeClass('displaynone');
            $('#moreDot').addClass('displaynone');
            $('#moreShow').addClass('displaynone');
            let recentContact = Utility.getStorage("recentContact");
            let newContact = await Utility.getRecentContact(recentContact.length, 7, this.context.router);
            recentContact = recentContact.concat(newContact);
            this.setState({ data: recentContact });
            Utility.setStorage("recentContact", recentContact);

            if (newContact.length < 7) {
                $('#moreImg').addClass('displaynone');
                $('#moreDone').removeClass('displaynone');
            }
            else {
                $('#moreImg').addClass('displaynone');
                $('#moreDot').removeClass('displaynone');
                $('#moreShow').removeClass('displaynone');
            }
        }
    }

    //传递到MessageWindow里的方法，在MessageWindow里控制MessageMessage刷新界面
    async onChange() {
        let recentContact = Utility.getStorage("recentContact");
        this.setState({ data: recentContact, chatObj: recentContact[0] });
        //选中第一个联系人
        $('.message-message-pList > div').removeClass('message-message-pFocus');
        $(`#${this.state.chatObj.name}`).addClass('message-message-pFocus');
    }

	render() {
        //给我的私信添加选中样式
        $('.message-nav > div').removeClass('message-nav-focus');
        $('#message').addClass('message-nav-focus');
        //先看state里有没有数组，防止报错
        let data = this.state.data;
        let chatObj = this.state.chatObj;
        if (!chatObj) {
            chatObj = {
                id: 9898,
                name: '系统',
                portraitUrl: 'http://file.cc98.org/uploadfile/2017/11/24/024368341.gif',
                message: [{
                    id: 9898,
                    senderId: 9898,
                    receiverId: 9898,
                    content: "",
                    isRead: true,
                    time: new Date(),
                    showTime: true
                }]
            }
        }
        if (!data) {
            data = [chatObj];
        }
        console.log("正式开始数据填充的时候");
        console.log(data);
        console.log(chatObj);
        //创建联系人列表和聊天窗口
        return (<div className="message-message">
                <div className="message-message-people">
                    <div className="message-message-pTitle">近期私信</div>
                    <div className="message-message-pList">
                    {data.map(this.coverMessagePerson)}
                    <div className="message-message-plMore" onClick={this.getMoreContact}>
                            <img id="moreImg" src="http://file.cc98.org/uploadfile/2017/11/19/2348481046.gif" className="displaynone"></img>
                            <div id="moreDot">...</div>
                            <div id="moreShow">显示更多小伙伴~</div>
                            <div id="moreDone" className="displaynone">小伙伴们都出来了~</div>
                        </div>
                    </div>
                </div>
                <MessageWindow data={chatObj} onChange={this.onChange} />
            </div>);
    }
}

//查找数组arr中是否存在元素的名字为obj
function contains(arr , obj) {
    let i = arr.length;
    while (i--) {
        if (arr[i].name === obj) {
            return true;
        }
    }
    return false;
}