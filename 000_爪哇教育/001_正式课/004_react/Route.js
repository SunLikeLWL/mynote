
export class Route extends React.Component {
    componentWillMount() {
        const unlisten =
            history.listen((location, action) => {
                console.log('history change listen',
                    location, action);
                this.forceUpdate();
            });
        this.setState({ unlisten });
    }
    componentWillUnmount() {
        const { unlisten } = this.state;
        unlisten();
    }
    render() {
        const {
            render,
            path,
            component: ChildComponent,
        } = this.props;
        const match = matchPath(path);
        const matchResult =
            match(window.location.pathname);
        if (!matchResult) return null;
        if (ChildComponent) {
            return (<ChildComponent match={matchResult} />);
        }
        if (render && typeof render ===
            'function') {
            return render({ matchResult });
        }
        return null;
    }
}