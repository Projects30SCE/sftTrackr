import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Select,
  Button,
  Form,
  Input,
} from "antd";

import { CONSTANTS } from "../../utils/constants";
import { sftFormActions } from "../../store/sft-form-slice";
import { generatePassword } from "../../utils/telegramSender";

import "./SFTForm.css";

const passwordFormatOptions = [
  {
    label: "Add Special Character",
    value: CONSTANTS.PASSWORD_FORM.PASSWORD_FORMATS.ADD_SPECIAL_CHARACTER,
  },
  // {
  //   label: "Add Numbers",
  //   value: CONSTANTS.PASSWORD_FORM.PASSWORD_FORMATS.ADD_NUMBERS,
  // },
  {
    label: "Only Letters",
    value: CONSTANTS.PASSWORD_FORM.PASSWORD_FORMATS.ONLY_LETTERS,
  },
  {
    label: "Captial Letters",
    value: CONSTANTS.PASSWORD_FORM.PASSWORD_FORMATS.CAPTIAL_LETTERS,
  },
];

/** Initial form values. */
const initialPasswordFormatValues = [
  CONSTANTS.PASSWORD_FORM.PASSWORD_FORMATS.ADD_SPECIAL_CHARACTER,
  // CONSTANTS.PASSWORD_FORM.PASSWORD_FORMATS.ADD_NUMBERS,
  CONSTANTS.PASSWORD_FORM.PASSWORD_FORMATS.ONLY_LETTERS,
  CONSTANTS.PASSWORD_FORM.PASSWORD_FORMATS.CAPTIAL_LETTERS,
];

const initialIterationValue =
  CONSTANTS.PASSWORD_FORM.INITIAL_VALUES.INITIAL_ITERATION_VALUE;

let index = 5;
const PasswordForm = () => {
  const dispatch = useDispatch();
  const { Option } = Select;
  const [items, setItems] = useState([]);

  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };

  const [name, setName] = useState("");
  const inputRef = useRef(null);
  const onNameChange = (event) => {
    setName(event.target.value);
  };

  const deleteOption = (value) => {
    setItems(
      items.filter((item) => {
        return item.value !== value;
      })
    );
    console.log("deleted", value);
  };

  const addItem = (e) => {
    e.preventDefault();
    setItems([...items, { id: index++, value: name, label: name }]);
    setName("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  /** Form handlers. */
  const onFinish = (values) => {
    // console.log("Success:", values);
    generatePassword(values);
    dispatch(sftFormActions.openOutputModal());
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Form
      name="basic"
      initialValues={{
        passwordFormat: initialPasswordFormatValues,
        iteration: initialIterationValue,
      }}
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
        <Input />
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
        <Input />
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
        <Input />
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
        <Input />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Start Activity
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PasswordForm;
