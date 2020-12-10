import 'antd/dist/antd.css';

function BasicLayout(props) {
  return (
    <div style={{ padding: 10 }}>
      {props.children}
    </div>
  );
}

export default BasicLayout;
