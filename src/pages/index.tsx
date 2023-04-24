import { type NextPage } from "next";
import Head from "next/head";
import { api, type RouterOutputs } from "~/utils/api";

import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import React, {
  type ReactNode,
  useCallback,
  useReducer,
  useState,
  memo,
  type FormEvent,
  type ChangeEvent,
  useId,
  useEffect,
} from "react";
import { Modal } from "~/components/modal";
import cn from "classnames";

type ReducerTypeFilter = {
  visited: number;
  coffee: number;
  workingSpace: number;
};

type KeyPayloadFilter = keyof ReducerTypeFilter;

type SetFilter = {
  type: "SET_FILTER";
  payload: KeyPayloadFilter;
};

type ActionFilter = SetFilter;
function reducer(state: ReducerTypeFilter, action: ActionFilter) {
  switch (action.type) {
    case "SET_FILTER":
      if (action.payload === "visited") {
        return { ...state, [action.payload]: 1 - state[action.payload] };
      }
      if (state[action.payload]) return state;

      if (action.payload === "coffee") {
        return { ...state, [action.payload]: 1, workingSpace: 0 };
      }
      return {
        ...state,
        [action.payload]: 1,
        coffee: 0,
      };
    default:
      return state;
  }
}
const Home: NextPage = () => {
  const ctx = api.useContext();

  const invalidateData = useCallback(() => {
    void ctx.review.getAll.invalidate();
  }, [ctx.review.getAll])

  const [showModal, setShowModal] = useState(false);
  
  const [filter, dispatchFilter] = useReducer(reducer, {
    visited: 1,
    coffee: 1,
    workingSpace: 0,
  });
  
  const { data, isLoading } = api.review.getAll.useQuery({
    visited: filter.visited,
    category: filter.coffee ? 1 : 2,
  });

  const toggleModal = useCallback(() => {
    setShowModal((c) => !c);
  }, []);

  if (isLoading) return <LoadingPage />;

  return (
    <>
      <Head>
        <title>Restaurant Review</title>
        <meta name="description" content="Restaurant Review on Bandung Area" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ModalForm show={showModal} onHide={toggleModal} onSuccess={invalidateData} />
      <main className="mx-auto h-screen max-w-4xl justify-center px-4 pb-6 pt-12">
        <div className="mb-8 flex justify-between">
          <h1 className="text-4xl">Restaurant Review</h1>
          <button
            className="block rounded-md bg-green-500 px-4 py-2 text-lime-50 hover:bg-green-700"
            onClick={() => setShowModal((c) => !c)}
          >
            + New Review
          </button>
        </div>
        <MemoFilter filter={filter} dispatchFilter={dispatchFilter} />
        {isLoading ? (
          <LoadingPage />
        ) : (
          <>
            {!data?.length ? (
              <div className="mt-16 flex flex-col items-center gap-y-4 text-center">
                <SadIcon />
                <h2 className="text-3xl leading-loose">
                  Ooops, There is no data here. <br />
                  try different category or <br />
                  find new restaurant!
                </h2>
              </div>
            ) : (
              <div className="flex flex-col items-stretch gap-x-4 gap-y-8 sm:grid sm:grid-cols-2 md:grid-cols-3">
                {data.map((item) => {
                  return <MemoCard key={item.id} {...item} />;
                })}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
};

const MemoFilter = memo(Filter)
type FilterProps = {
  filter: ReducerTypeFilter;
  dispatchFilter: React.Dispatch<SetFilter>;
};
function Filter({ filter, dispatchFilter }: FilterProps) {
  console.log({ filter })
  const onClick = (payload: KeyPayloadFilter) => {
    dispatchFilter({
      type: "SET_FILTER",
      payload,
    });
  };
  return (
    <div className="mb-8 flex justify-center gap-x-4">
      <ToggleVisited
        active={filter.visited}
        onClick={() => onClick("visited")}
      />
      <ToggleCoffee active={filter.coffee} onClick={() => onClick("coffee")} />
      <ToggleLaptop
        active={filter.workingSpace}
        onClick={() => onClick("workingSpace")}
      />
    </div>
  );
}

type CardToggleType = {
  children: ReactNode;
  active: number;
  onClick: () => void;
};
function CardToggle({ children, active, onClick }: CardToggleType) {
  return (
    <div
      className={cn(
        "flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-y-4 rounded-md border",
        {
          "border-neutral-800 shadow-md": active,
          "border-neutral-400": !active,
        }
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

type ToggleProps = {
  active: number;
  onClick: () => void;
};
function ToggleVisited({ active, onClick }: ToggleProps) {
  return (
    <CardToggle onClick={onClick} active={active}>
      <VisitedIcon visited={active} />
      <span>Visited</span>
    </CardToggle>
  );
}

function ToggleCoffee({ active, onClick }: ToggleProps) {
  return (
    <CardToggle onClick={onClick} active={active}>
      <CoffeeIcon active={active} />
      <span>Cafe</span>
    </CardToggle>
  );
}

function ToggleLaptop({ active, onClick }: ToggleProps) {
  return (
    <CardToggle onClick={onClick} active={active}>
      <LaptopIcon active={active} />
      <span>Working</span>
    </CardToggle>
  );
}

type ModalFormProps = {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
};


type FormProps = {
  restaurant: string;
  rating: number;
  description: string;
  photos: string;
  category: number;
  location: string;
  price: number | string;
  website: string;
  visited: number;
}

type FormAction =
  | { type: "UPDATE"; payload: Partial<FormProps> }
  | { type: "RESET"; payload: FormProps };

const formReducer = (state: FormProps, action: FormAction): FormProps => {
  switch (action.type) {
    case "UPDATE":
      return { ...state, ...action.payload };
    case "RESET":
      return action.payload;
    default:
      return state;
  }
};

const initForm: FormProps = {
  restaurant: "",
  rating: 0,
  description: "",
  photos: "",
  category: 0,
  location: "",
  price: "",
  website: "",
  visited: 0,
};

function ModalForm({ show, onHide }: ModalFormProps) {
  const ctx = api.useContext();

  const [data, dispatch] = useReducer(formReducer, initForm);

  useEffect(() => {
    if (!show) return;
    dispatch({
      type: "RESET",
      payload: initForm
    })
  }, [show])

  const updateForm = (data: Partial<FormProps>) => {
    dispatch({
      type: "UPDATE",
      payload: data,
    });
  };

  const onChangeForm = (e: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateForm({
      [e.currentTarget.name]: e.currentTarget.value
    });
  }

  const { mutate } = api.review.create.useMutation({
    onSuccess: () => {
      dispatch({
        type: "RESET",
        payload: initForm,
      });
      onHide();
      void ctx.review.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      console.log("zodError", e.data?.zodError, { errorMessage });
    },
  });

  const submitData = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const payload = {
      ...data,
      price: +data.price
    }
    mutate(payload);
  };

  const generateReview = (rating: number) => {
    if (rating === 1) return "So bad!";
    if (rating === 2) return "Meh!!";
    if (rating === 3) return "Hmmm decent";
    if (rating === 4) return "Could be perfect!";
    if (rating === 5) return "Definitely going back!";
    return "";
  }
  return (
    <Modal show={show} onHide={onHide} title="Restaurant Review">
      <form className="flex flex-col gap-y-4" onSubmit={submitData}>
        <FormInput
          name="restaurant"
          value={data.restaurant}
          onChange={onChangeForm}
          label="Restaurant"
        />
        <div className="relative">
          <textarea
            id="description"
            className="peer relative rounded-md border p-3 outline-none w-full"
            name="description"
            placeholder=" "
            onChange={onChangeForm}
            value={data.description}
            rows={3}
          />
          <label
            className="absolute left-3 -top-3 z-10 bg-white font-bold text-black duration-150 peer-placeholder-shown:top-3 peer-placeholder-shown:font-normal peer-placeholder-shown:text-zinc-300 peer-focus:-top-3 peer-focus:font-bold peer-focus:text-black"
            htmlFor="description"
          >
            Description
          </label>
        </div>
        <FormInput
          name="location"
          value={data.location}
          onChange={onChangeForm}
          label="Restaurant"
        />
        <FormInput
          name="price"
          value={data.price}
          onChange={(e) => {
            const value = e.target.value;
            updateForm({
              price: value ? +value : "",
            });
          }}
          label="Price"
        />
        <FormInput
          name="website"
          value={data.website}
          onChange={onChangeForm}
          label="Restaurant"
        />
        <div>
          <label htmlFor="photos">Photos</label>
          <input
            id="photos"
            name="photos"
            placeholder="Input restaurant photos"
            value={data.photos}
            onChange={onChangeForm}
          />
        </div>
        <div className="flex gap-x-4">
          <ToggleVisited
            onClick={() => updateForm({ visited: 1 - data.visited })}
            active={data.visited}
          />
          <ToggleCoffee
            onClick={() => updateForm({ category: 1 })}
            active={data.category === 1 ? 1 : 0}
          />
          <ToggleLaptop
            onClick={() => updateForm({ category: 2 })}
            active={data.category === 2 ? 1 : 0}
          />
        </div>
        <div className="flex gap-x-4 items-center">
          <RatingStart
            size={36}
            rating={data?.rating}
            onClick={(rating) => {
              updateForm({
                rating,
              });
            }}
          />
          <span>{generateReview(data?.rating)}</span>
        </div>
        <button
          className="block w-full rounded-md bg-green-500 py-4 text-lime-50 hover:bg-green-700"
          type="submit"
        >
          Review !
        </button>
      </form>
    </Modal>
  );
}

type FormInputProps = {
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  label: string;
  name: string;
};

function FormInput({ value, onChange, label, name }: FormInputProps) {
  const id = useId()
  return (
    <div className="relative">
      <input
        id={id}
        className="peer relative rounded-md border p-3 outline-none w-full"
        name={name}
        value={value}
        onChange={onChange}
        placeholder=" "
      />
      <label htmlFor={id} className="absolute left-3 -top-3 z-10 bg-white font-bold text-black duration-150 peer-placeholder-shown:top-3 peer-placeholder-shown:font-normal peer-placeholder-shown:text-zinc-300 peer-focus:-top-3 peer-focus:font-bold peer-focus:text-black">
        {label}
      </label>
    </div>
  );
}

const MemoCard = memo(Card);
type RestaurantReview = RouterOutputs["review"]["getAll"][number];
function Card({
  restaurant,
  rating,
  description,
  photos,
  visited,
  category,
}: RestaurantReview) {
  const photo = photos?.split("#")[0];
  return (
    <div className="bg-[rgba(255, 255, 255, 0.15)] relative flex max-w-[277px] flex-1 flex-col justify-items-stretch gap-y-5 overflow-hidden rounded-lg border border-white pt-4 shadow-lg">
      <div className="left absolute -top-8 -left-8 -z-10 h-28 w-28 rounded-full bg-lime-200"></div>
      <span
        className="absolute top-2 right-2"
        title={visited ? "visited" : "not visited"}
      >
        <VisitedIcon visited={visited} />
      </span>
      <div className="flex flex-col gap-y-3 px-4">
        <Badge category={category} />
        <p className="text-slate-80 text-2xl font-bold">{restaurant}</p>
        <div className="flex items-center gap-x-3 text-lg">
          <span>{rating}.0</span>
          <RatingStart readOnly rating={rating} />
        </div>
        <div
          className="text-sm text-slate-600 line-clamp-3"
          title={description}
        >
          {description}
        </div>
      </div>
      {Boolean(photo) && (
        <span className="relative h-40 w-full rounded-b-lg mt-auto">
          <Image
            className="rounded-b-lg"
            alt={restaurant}
            fill
            src="/Mia%20Kuah%20Sapi.jpg"
          />
        </span>
      )}
    </div>
  );
}

const categories: Record<number, string> = {
  1: "Cafe",
  2: "Working Space",
};
function Badge({ category }: { category: number }) {
  return (
    <div className="top-2 left-4 w-max rounded-md bg-lime-400 p-1 text-xs text-white">
      {categories[category]}
    </div>
  );
}

type RatingStarProps = {
  rating?: number;
  readOnly?: boolean;
  onClick?: (rating: number) => void;
  size?: number
};
function RatingStart({
  rating = 0,
  readOnly = false,
  onClick,
  size = 16,
}: RatingStarProps) {
  const ratings = new Array(5).fill(1);
  return (
    <div
      className={cn("flex", {
        group: !readOnly,
        "gap-x-2": readOnly,
      })}
    >
      {ratings.map((_, index) => {
        return (
          <svg
            key={index}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={cn({
              "peer peer-hover:[&>*]:fill-[#bdbdbd] cursor-pointer": !readOnly,
            })}
            onClick={() => onClick?.(index + 1)}
          >
            <path
              className={cn({
                "peer group-hover:fill-[#ffe400]": !readOnly,
              })}
              fill={index < rating ? "#ffe400" : "#bdbdbd"}
              d="M12 2.582L9.175 8.246.793 9.41l6.1 5.93-1.817 7.66L12 18.941l7.924 4.059-1.817-7.66 6.1-5.93-8.382-1.164z"
            />
          </svg>
        );
      })}
    </div>
  );
}

function VisitedIcon({ visited }: { visited: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
      <circle cx="20" cy="20" r="18" fill={visited ? "#059669" : "#e5e7eb"} />
      <path
        d="M12,20 l4,4 l12,-12"
        stroke="white"
        strokeWidth="4"
        fill="none"
      />
    </svg>
  );
}

function CoffeeIcon({ active }: { active: number }) {
  return (
    <svg
      height="40"
      width="40"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 275.353 275.353"
      fill="#000000"
      stroke="#000000"
      transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)"
    >
      <g strokeWidth="0"></g>
      <g strokeLinecap="round" strokeLinejoin="round"></g>
      <g>
        <g>
          <g>
            <g>
              <g>
                <path
                  fill={active ? "#059669" : "#e5e7eb"}
                  d="M229.784,199.712c27.269,0,45.568-29.692,45.568-57.419c0-20.117-12.418-22.843-24.562-22.843 c-3.468,0-7.21,0.234-11.167,0.479c-3.195,0.176-6.507,0.332-9.848,0.41l0.039-0.889H1.514c0,42.959,24.132,80.321,59.686,99.49 C24.787,221.333,0,226.043,0,231.445c0,7.865,51.782,14.196,115.659,14.196s115.649-6.331,115.649-14.196 c0-5.432-24.904-10.132-61.454-12.516c10.63-5.725,20.263-13.004,28.529-21.641 C208.026,199.712,219.448,199.712,229.784,199.712z M229.364,128.272c3.683-0.088,7.289-0.244,10.737-0.469 c3.83-0.205,7.464-0.42,10.698-0.42c11.509,0,16.658,2.159,16.658,14.909c0,23.419-15.466,49.515-37.664,49.515 c-9.751,0-18.3-0.205-25.285-1.358C218.559,173.196,227.537,151.731,229.364,128.272z M98.982,97.203 c-0.557-0.547-13.414-13.922,0.156-30.327c16.58-20,0.01-37-0.156-37.166l-3.595,3.595c0.557,0.537,13.414,13.932-0.166,30.327 c-16.58,20.029-0.01,37.039,0.166,37.195L98.982,97.203z M118.737,97.203c-0.557-0.547-13.414-13.922,0.166-30.327 c16.56-20,0-37-0.166-37.166l-3.605,3.595c0.557,0.537,13.414,13.932-0.156,30.327c-16.56,20.039-0.01,37.039,0.166,37.205 L118.737,97.203z M140.251,97.203c-0.557-0.547-13.414-13.922,0.156-30.327c16.57-20,0-37-0.156-37.166l-3.615,3.595 c0.547,0.537,13.424,13.932-0.166,30.327c-16.56,20.039,0,37.039,0.176,37.205L140.251,97.203z"
                ></path>
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

function LaptopIcon({ active }: { active: number }) {
  return (
    <svg
      width="40px"
      height="40px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g strokeLinecap="round" strokeLinejoin="round"></g>
      <g>
        <g>
          <path
            fill={active ? "#059669" : "#e5e7eb"}
            d="M4 17H3.5C2.67157 17 2 17.6716 2 18.5C2 19.3284 2.67157 20 3.5 20H20.5C21.3284 20 22 19.3284 22 18.5C22 17.6716 21.3284 17 20.5 17H20M4 17H20M4 17V8.2002C4 7.08009 4 6.51962 4.21799 6.0918C4.40973 5.71547 4.71547 5.40973 5.0918 5.21799C5.51962 5 6.08009 5 7.2002 5H16.8002C17.9203 5 18.4796 5 18.9074 5.21799C19.2837 5.40973 19.5905 5.71547 19.7822 6.0918C20 6.5192 20 7.07899 20 8.19691V17"
            stroke="#000000"
            strokeWidth="0.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </g>
      </g>
    </svg>
  );
}

function SadIcon() {
  return (
    <svg
      width="136px"
      height="136px"
      viewBox="0 0 128.00 128.00"
      xmlns="http://www.w3.org/2000/svg"
      fill="#000000"
      strokeWidth="1.6640000000000001"
      transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)"
    >
      <g strokeWidth="0"></g>
      <g
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#CCCCCC"
        strokeWidth="1"
      ></g>
      <g>
        <g>
          <g>
            <path d="M64,3A61,61,0,1,1,3,64,61.06,61.06,0,0,1,64,3m0-3a64,64,0,1,0,64,64A64,64,0,0,0,64,0Z"></path>
            <path d="M85.57,49.28a1.5,1.5,0,0,0-1.5,1.5v9a1.5,1.5,0,0,0,3,0v-9A1.5,1.5,0,0,0,85.57,49.28Z"></path>
            <path d="M42.43,49.28a1.5,1.5,0,0,0-1.5,1.5v9a1.5,1.5,0,0,0,3,0v-9A1.5,1.5,0,0,0,42.43,49.28Z"></path>
            <path d="M87.11,92.08a41,41,0,0,0-26-7.22,40.13,40.13,0,0,0-9.48,1.88,18,18,0,0,0-2.72-7.8C47,76,44.67,74.33,42.43,74.33S37.84,76,36,78.94c-2.2,3.42-4,9.11-1.79,13.9,1.38,3,4.47,6,8.26,6s6.89-3,8.27-6a11,11,0,0,0,.86-2.92,36.88,36.88,0,0,1,9.76-2.07,37.94,37.94,0,0,1,24.09,6.7,1.51,1.51,0,0,0,2.08-.38A1.49,1.49,0,0,0,87.11,92.08ZM48,91.59c-.68,1.49-2.71,4.3-5.54,4.3s-4.85-2.81-5.53-4.3c-1.58-3.45-.34-8,1.58-11,1.27-2,2.82-3.23,4-3.23s2.69,1.27,4,3.23C48.31,83.56,49.55,88.14,48,91.59Z"></path>
          </g>
        </g>
      </g>
    </svg>
  );
}
export default Home;
