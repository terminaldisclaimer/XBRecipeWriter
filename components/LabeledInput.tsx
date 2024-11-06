import { useEffect, useState, } from 'react';
import { TextInputProps,   } from 'react-native';
import { H6, Input, Label, Slider, XStack, YStack } from 'tamagui';

const HEADER_HEIGHT = 250;



type Props = TextInputProps  & {
  validateInput?: ValidateCallbackFunction
  onValidEditFunction?: ValidEditCallbackFunction
  setErrorFunction?: (error: boolean) => void
  initialValue?:string
  pourNumber?: number
  label: string
  errorMessage?: string
  width?: number
  disabled?: boolean
  maxLength: number  
};

type ValidateCallbackFunction = (value: string) => boolean;
type ValidEditCallbackFunction = (inputLabel: string, value: string, pourNumber?: number) => Promise<void>;


export default function LabeledInput(props: Props) {
  const [validated, setValidated] = useState(true);
  const [value, setValue] = useState(props.initialValue);

 

  async function validate(value: string): Promise<boolean> {
    setValue(value);
    if (props.validateInput !== undefined) {
      var valid = props.validateInput(value);
      setValidated(valid);
      props.setErrorFunction?(!valid):undefined;
      if(valid){
        doneEditing(value);
      }
      return valid;
    }else{
      setValidated(true);
      doneEditing(value);
      return true;
    }
  }

  async function doneEditing(value: string) {
    if (validated) {
      if (props.onValidEditFunction) {
        if (props.pourNumber !== undefined) {
          props.onValidEditFunction(props.label?.toString()!, value, props.pourNumber);
        } else {
          props.onValidEditFunction(props.label?.toString()!, value);
        }
      }
    }
  }



  
  return (
    <>
      <YStack maxWidth={400}>
        <XStack maxWidth={400} paddingLeft="$2" paddingVertical="$2" alignItems="center" alignSelf="flex-start" space>
          <Label>{props.label}</Label>
    
          <Input width={props.maxLength * 13} maxWidth={props.maxLength * 13} disabled={props.disabled} marginLeft="$1" value={value ? "" + value : ""} onChangeText={(val) => validate(val)} focusStyle={{ borderColor: validated ? "blue" : "red" }} borderColor={validated ? "blue" : "red"} {...props} backgroundColor={props.disabled ? "#D3D3D3" : "white"}>

          </Input>

        </XStack>
        {!validated ? <H6 fontWeight="600" color="red" padding="$2">{"Error: " + props.errorMessage}</H6> : ""}
      </YStack>
    </>
  );
}



