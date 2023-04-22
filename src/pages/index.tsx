import { type NextPage } from "next";
import Head from "next/head";
import { api, type RouterOutputs } from "~/utils/api";

import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { useCallback, useState } from "react";
import { Modal } from "~/components/modal";

const Home: NextPage = () => {
  const { data, isLoading } = api.review.getAll.useQuery();

  const [showModal, setShowModal] = useState(false);

  const toggleModal = useCallback(() => {
    setShowModal((c) => !c);
  }, [])

  if (isLoading) return <LoadingPage />;

  if (!data) return <></>;
  return (
    <>
      <Head>
        <title>Restaurant Review</title>
        <meta name="description" content="Restaurant Review on Bandung Area" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ModalForm show={showModal} onHide={toggleModal} />
      <main className="mx-auto h-screen max-w-4xl justify-center px-4 pb-6 pt-12">
        <div className="mb-8 flex justify-between">
          <h1 className="text-4xl">Restaurant Review</h1>
          <button
            className="block rounded-md bg-lime-300 px-4 py-2 text-lime-50"
            onClick={() => setShowModal((c) => !c)}
          >
            Add
          </button>
        </div>
        <div className="flex flex-col items-center gap-x-4 gap-y-8 sm:grid sm:grid-cols-2 md:grid-cols-3">
          {data?.map((item) => {
            return <Card key={item.id} {...item} />;
          })}
        </div>
      </main>
    </>
  );
};

type ModalFormProps = {
  show: boolean;
  onHide: () => void
}
function ModalForm({ show, onHide }: ModalFormProps) {
  return (
    <Modal show={show} onHide={onHide} title="Form Data">
      Halo ini ko ngga ada
    </Modal>
  );
}


type RestaurantReview = RouterOutputs["review"]["getAll"][number];
function Card({ restaurant, rating, description, photos, visited, category }: RestaurantReview) {
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
          <RatingStart rating={rating} />
        </div>
        <div
          className="text-sm text-slate-600 line-clamp-3"
          title={description}
        >
          {description}
        </div>
      </div>
      {Boolean(photo) && (
        <span className="relative h-40 w-full rounded-b-lg">
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
  2: "Working Space"
}
function Badge({ category }: { category: number }) {
  return <div className="top-2 left-4 text-xs bg-lime-400 p-1 rounded-md text-white w-max">{categories[category]}</div>;
}

function RatingStart({ rating }: { rating: number }) {
  const ratings = new Array(5).fill(1)
  return (
    <div className="flex gap-x-2">
      {ratings.map((_, index) => {
        return (
          <svg
            key={index}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
          >
            <path
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
export default Home;

