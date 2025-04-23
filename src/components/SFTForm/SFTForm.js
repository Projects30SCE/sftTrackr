import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, Input } from "antd";

import { CONSTANTS } from "../../utils/constants";

import {
  checkIfActivityHasStarted,
  getFromLocal,
  saveToLocal,
} from "../../utils/telegramSender";

import "./SFTForm.css";

const SFTForm = () => {
  const dispatch = useDispatch();
  const [isActivityStarted, setIsActivityStarted] = useState(
    checkIfActivityHasStarted()
  );

  /** Form handlers. */
  const onFinish = (values) => {
    // console.log("Success:", values);
    const time = new Date();
    const formattedTime = time.toLocaleString();
    saveToLocal(CONSTANTS.FORM_ITEM_KEYS.RANK_NAME, values.rankName);
    saveToLocal(
      CONSTANTS.FORM_ITEM_KEYS.PLATOON_SECTION,
      values.platoonSection
    );
    saveToLocal(CONSTANTS.FORM_ITEM_KEYS.LOCATION, values.location);
    saveToLocal(CONSTANTS.FORM_ITEM_KEYS.ACTIVITY, values.activity);
    saveToLocal(CONSTANTS.FORM_ITEM_KEYS.START_TIME, formattedTime);
    setIsActivityStarted(true);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Form
      name="basic"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Form.Item
        label="Rank/ Name"
        name="rankName"
        rules={[
          {
            required: true,
            message: "Please input the rank and name!",
          },
        ]}
      >
        <Input
          disabled={isActivityStarted}
          defaultValue={
            isActivityStarted
              ? getFromLocal(CONSTANTS.FORM_ITEM_KEYS.RANK_NAME)
              : ""
          }
        />
      </Form.Item>

      <Form.Item
        label="Platoon/ Section"
        name="platoonSection"
        rules={[
          {
            required: true,
            message: "Please input your platoon and section!",
          },
        ]}
      >
        <Input
          disabled={isActivityStarted}
          defaultValue={
            isActivityStarted
              ? getFromLocal(CONSTANTS.FORM_ITEM_KEYS.PLATOON_SECTION)
              : ""
          }
        />
      </Form.Item>

      <Form.Item
        label="Location"
        name="location"
        rules={[
          {
            required: true,
            message: "Please input location!",
          },
        ]}
      >
        <Input
          disabled={isActivityStarted}
          defaultValue={
            isActivityStarted
              ? getFromLocal(CONSTANTS.FORM_ITEM_KEYS.LOCATION)
              : ""
          }
        />
      </Form.Item>

      <Form.Item
        label="Activity"
        name="activity"
        rules={[
          {
            required: true,
            message: "Please input activity!",
          },
        ]}
      >
        <Input
          disabled={isActivityStarted}
          defaultValue={
            isActivityStarted
              ? getFromLocal(CONSTANTS.FORM_ITEM_KEYS.ACTIVITY)
              : ""
          }
        />
      </Form.Item>

      {!isActivityStarted && (
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Start Activity
          </Button>
        </Form.Item>
      )}
      {isActivityStarted && (
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Stop Activity
          </Button>
        </Form.Item>
      )}
    </Form>
  );
};

export default SFTForm;
