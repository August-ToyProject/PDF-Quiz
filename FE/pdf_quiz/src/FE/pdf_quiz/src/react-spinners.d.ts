declare module 'react-spinners' {	
    import * as React from 'react';	

    interface LoaderProps {	
      loading?: boolean;  // 필수 속성에서 선택적 속성으로 변경	
      color?: string;	
      size?: number | string;	
      css?: string;	
    }	

    export class SyncLoader extends React.Component<LoaderProps> {}	
  }	
