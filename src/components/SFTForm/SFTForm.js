import { useState } from "react";
import { Button, Form, Input, Modal, Checkbox, message } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

import { CONSTANTS } from "../../utils/constants";
import {
  checkIfActivityHasStarted,
  getFromLocal,
  removeFromLocal,
  saveToLocal,
  sendEndTelegramMessage,
  sendStartTelegramMessage,
} from "../../utils/telegramSender";
import { getSFTChecklist } from "../../utils/googleSheetAPI";

import "./SFTForm.css";

const SFTForm = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const [isActivityStarted, setIsActivityStarted] = useState(
    checkIfActivityHasStarted()
  );
  const [isMessageSending, setIsMessageSending] = useState(false);
  const [isModalShown, setIsModalShown] = useState(false);
  const [isLoadingChecklist, setIsLoadingChecklist] = useState(false);
  const [SFTChecklist, setSFTChecklist] = useState([]);
  const [checkedList, setCheckedList] = useState([]);

  const initialValues = {
    rankName: getFromLocal(CONSTANTS.FORM_ITEM_KEYS.RANK_NAME)
      ?.split(",")
      .map((name) => name.trim()) || [""],
    platoonSection:
      getFromLocal(CONSTANTS.FORM_ITEM_KEYS.PLATOON_SECTION) || "",
    location: getFromLocal(CONSTANTS.FORM_ITEM_KEYS.LOCATION) || "",
    activity: getFromLocal(CONSTANTS.FORM_ITEM_KEYS.ACTIVITY) || "",
  };

  /** Form handlers */
  const onFinish = async (values) => {
    console.log(values);
    const formattedTime = new Date().toLocaleString();
    const rankNames = values.rankName.map((item) => item).filter(Boolean);
    saveToLocal(CONSTANTS.FORM_ITEM_KEYS.RANK_NAME, rankNames.join(","));
    // saveToLocal(CONSTANTS.FORM_ITEM_KEYS.RANK_NAME, values.rankName);
    saveToLocal(
      CONSTANTS.FORM_ITEM_KEYS.PLATOON_SECTION,
      values.platoonSection
    );
    saveToLocal(CONSTANTS.FORM_ITEM_KEYS.LOCATION, values.location);
    saveToLocal(CONSTANTS.FORM_ITEM_KEYS.ACTIVITY, values.activity);
    saveToLocal(CONSTANTS.FORM_ITEM_KEYS.START_TIME, formattedTime);

    setIsModalShown(true);
    setIsLoadingChecklist(true);

    try {
      const data = await getSFTChecklist(CONSTANTS.SHEETS);
      setSFTChecklist(data);
    } catch (error) {
      messageApi.error("Failed to load checklist.");
    } finally {
      setIsLoadingChecklist(false);
    }
  };

  const startActivity = async () => {
    if (checkedList.length !== SFTChecklist.length) {
      messageApi.error(
        "Please complete the checklist before starting the activity."
      );
      return;
    }

    setIsMessageSending(true);
    await sendStartTelegramMessage();
    setIsActivityStarted(true);
    setIsMessageSending(false);
    setIsModalShown(false);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const onFinishActivity = async () => {
    const formattedTime = new Date().toLocaleString();

    saveToLocal(CONSTANTS.FORM_ITEM_KEYS.END_TIME, formattedTime);
    await sendEndTelegramMessage();

    // Clear local storage
    [
      CONSTANTS.FORM_ITEM_KEYS.RANK_NAME,
      CONSTANTS.FORM_ITEM_KEYS.PLATOON_SECTION,
      CONSTANTS.FORM_ITEM_KEYS.LOCATION,
      CONSTANTS.FORM_ITEM_KEYS.ACTIVITY,
      CONSTANTS.FORM_ITEM_KEYS.START_TIME,
      CONSTANTS.FORM_ITEM_KEYS.END_TIME,
    ].forEach(removeFromLocal);

    form.setFieldsValue({
      rankName: "",
      platoonSection: "",
      location: "",
      activity: "",
    });
    setCheckedList([]);
    setIsActivityStarted(false);
  };

  const onChecklistChange = (list) => {
    setCheckedList(list);
  };

  return (
    <>
      {contextHolder}
      <Form
        form={form}
        name="basic"
        initialValues={initialValues}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        {/* <Form.Item
          label="Rank/ Name"
          name="rankName"
          rules={[
            { required: true, message: "Please input the rank and name!" },
          ]}
        >
          <Input disabled={isActivityStarted} />
        </Form.Item> */}
        <Form.List
          name="rankName"
          rules={[
            {
              required: true,
              validator: async (_, rankName) => {
                if (!rankName || rankName.length < 2) {
                  return Promise.reject(
                    new Error("SFT must be done in buddy level")
                  );
                }
                if (rankName.some((v) => !v || !v.trim())) {
                  return Promise.reject(
                    new Error("All rank/name fields must be filled")
                  );
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <Form.Item label="Rank/ Name">
              {fields.map((field) => {
                const { key, ...fieldProps } = field; // extract key from spread
                return (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Form.Item
                      {...fieldProps} // spread without key
                      rules={[
                        { required: true, message: "Please input rank/name" },
                      ]}
                      noStyle
                    >
                      <Input
                        placeholder="Enter rank/name"
                        disabled={isActivityStarted}
                        style={{ flex: 1 }}
                      />
                    </Form.Item>

                    {fields.length > 1 && !isActivityStarted && (
                      <MinusCircleOutlined
                        onClick={() => remove(field.name)}
                        style={{ marginLeft: 8, fontSize: 20 }}
                      />
                    )}
                  </div>
                );
              })}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add("")} // Add empty string
                  style={{ width: "100%" }}
                  icon={<PlusOutlined />}
                  disabled={isActivityStarted}
                >
                  Add field
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </Form.Item>
          )}
        </Form.List>
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
          <Input disabled={isActivityStarted} />
        </Form.Item>

        <Form.Item
          label="Location"
          name="location"
          rules={[{ required: true, message: "Please input location!" }]}
        >
          <Input disabled={isActivityStarted} />
        </Form.Item>

        <Form.Item
          label="Activity"
          name="activity"
          rules={[{ required: true, message: "Please input activity!" }]}
        >
          <Input disabled={isActivityStarted} />
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
            <Button type="primary" danger onClick={onFinishActivity}>
              Stop Activity
            </Button>
          </Form.Item>
        )}
      </Form>

      <Modal
        title="SFT Checklist"
        open={isModalShown}
        onCancel={() => setIsModalShown(false)}
        footer={
          <Button
            type="primary"
            onClick={startActivity}
            loading={isMessageSending}
          >
            Start Activity
          </Button>
        }
        loading={isLoadingChecklist}
      >
        <h5>By submitting this form, I declare that:</h5>
        <Checkbox.Group value={checkedList} onChange={onChecklistChange}>
          {SFTChecklist.map((item) => (
            <Checkbox key={item} value={item} className="checkbox-label">
              {item}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </Modal>
    </>
  );
};

export default SFTForm;
