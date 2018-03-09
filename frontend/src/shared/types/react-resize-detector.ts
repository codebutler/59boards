declare module 'react-resize-detector' {

    interface ReactResizeDetectorProps extends React.Props<ReactResizeDetector> {
        handleHeight?: boolean;
        handleWidth?: boolean;
        onResize: (width: number, height: number) => void;
    }

    class ReactResizeDetector extends React.Component<ReactResizeDetectorProps> { }

    export = ReactResizeDetector;
}
