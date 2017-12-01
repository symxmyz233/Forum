﻿// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
import * as React from 'react';
import { MessageSystemProps } from '../Props/MessageSystemProps';
import { UbbContainer } from './UbbContainer'
declare let moment: any;

export class MessageSystembox extends React.Component<MessageSystemProps> {

    render() {
        let content = this.props.content;
        if (this.props.topicId) {
            let host = window.location.host;
            if (this.props.postId) {
                let a: any = this.props.postId / 10;
                let b = parseInt(a);
                let c = this.props.postId - b * 10;
                content = `${this.props.content}[url=http://${host}/topic/${this.props.topicId}/${b}#${c}][color=blue]http://${host}/topic/${this.props.topicId}/${b}#${c}[/color][/url]`;
            }
            else {
                content = `${this.props.content}[url=http://${host}/topic/${this.props.topicId}][color=blue]http://${host}/topic/${this.props.topicId}[/color][/url]`;
            }
        }
        console.log(content);
        return (<div className="message-system-box">
                    <div className="message-system-box-bar">
                            <div className="message-system-box-title">
                                {this.props.title}
                            </div>
                            <div className="message-system-box-date" >
                                {moment(this.props.time).format('YYYY-MM-DD HH:mm:ss')}
                        </div>
                    </div>
                    <div className="message-system-box-content">
                        <UbbContainer code={content} />
                    </div>
                </div>);
    }
}