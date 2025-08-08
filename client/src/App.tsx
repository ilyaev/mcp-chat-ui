import ChatMain from "./components/chat/ChatMain";
import { GoogleAuth } from "./components/common/GoogleAuth";
import { Provider } from "react-redux";
import { store } from "./store";
import Config from "./const";

function App() {
  return (
    <Provider store={store}>
      {Config.GOOGLE_CLIENT_ID ? (
        <GoogleAuth>
          <ChatMain />
        </GoogleAuth>
      ) : (
        <ChatMain />
      )}
    </Provider>
  );
}

export default App;
