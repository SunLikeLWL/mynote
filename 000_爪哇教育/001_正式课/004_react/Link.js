export class Link extends React.Component {
    handleClick = (e) => {
        const {
            replace,
            to,
        } = this.props;
        e.preventDefault();
        replace ? history.replace(to) :
            history.push(to);
    }
    render() {
        const {
            to,
            children,
        } = this.props;
        return (
            <a href={to} onClick={this.handleClick}>{children}</a>
        );
    }
}
import React from 'react';
import { createBrowserHistory } from
    'history';
import { match as matchPath } from 'pathto-regexp';
const history = createBrowserHistory();