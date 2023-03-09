export interface ChatFunctionModel {
  id: string;
  name: string;
  planName: string;
  type: string;
  value: string;
}

export interface ChatFullDescription {
  [p: string]: {
    type: string
    title: string
    childrens: Record<string, ChatDescriptionModel>
  };
}

export interface ChatDescriptionModel {
  description: string;
  [p: string]: string;
}
