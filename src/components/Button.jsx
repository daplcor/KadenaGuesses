export default function CustomButton(props) {
  return (
    <button
      className={` ${props.className}`}
      onClick={props.connected ? props.onDisconnect : props.onConnect}
     >
      {props.connected ? (props.account ? `${props.account?.slice(0, 7)}` : 'Connected') : 'Connect'}
    </button>
  );
}