export interface Fragment {
  _id: string;
  name: string;
  text: string;
  atajo: string;
  createdAt: string;
  updatedAt: string;
}

export interface FragmentCreate {
  name: string;
  text: string;
  atajo?: string;
}
