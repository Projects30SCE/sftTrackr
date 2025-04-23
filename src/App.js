import { Flex, Button } from "antd";

import SFTForm from "./components/SFTForm/SFTForm";

import "./App.css";

const App = () => {
  return (
    <Flex gap="middle" align="start" vertical>
      <Flex className="App-FlexBoxStyle" justify="center" align="center">
        <SFTForm />
        <Button type="primary" htmlType="submit">
          Stop Activity
        </Button>
      </Flex>
    </Flex>
  );
};

export default App;
