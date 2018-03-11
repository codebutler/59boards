declare module 'react-jss/lib/JssProvider' {
    import * as React from 'react';
    import 'react-jss/lib/JssProvider';
    import { GenerateClassName } from 'jss';

    interface JssProviderProps {
        jss: object;
        generateClassName: GenerateClassName<object>;
    }

    const JssProvider: React.ComponentType<JssProviderProps>;

    export default JssProvider;
}
