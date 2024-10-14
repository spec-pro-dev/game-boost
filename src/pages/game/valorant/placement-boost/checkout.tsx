import { ToggleSwitch } from "flowbite-react";
import { useEffect, useState } from "react";
import { FaArrowRight, FaTimes, FaTimesCircle } from "react-icons/fa";
import classNames from "../../../../consts/classNames";
import { useDispatch, useSelector } from "react-redux";
import extra_features from "../../../../data/game/league-of-legends/extra_features.json";

// Import variable

import {
  setCheckoutModal,
  setLoginModal,
} from "../../../../redux/slice/globalSlice";
import ModalAgent from "../../../../components/game/valorant/ModalAgent";
import { setAgents } from "../../../../redux/slice/game/valorantSlice";

const Checkout = () => {
  const [discount, setDiscount] = useState(false);
  const [applycode, setApplycode] = useState(0);
  const [extraFeatures, setExtraFeatures] = useState<any[]>([]);
  const [isOpenAgentModal, setisOpenAgentModal] = useState(false);
  let timeout: any = null;

  const dispatch = useDispatch();

  const current_rank = useSelector((d: any) => d.valorant?.current_rank);
  const placement_match = useSelector((d: any) => d.valorant?.placement_match);
  const desired_rank = useSelector((d: any) => d.valorant?.desired_rank);
  const server = useSelector((d: any) => d.valorant?.server);

  // Price
  const [price, setPrice] = useState(0);

  useEffect(() => {
    setExtraFeatures(extra_features);
  }, []);

  const handleChange = (event: any) => {
    switch (event.target.name) {
      case "applycode":
        setApplycode(event.target.value);
        break;
      default:
        break;
    }
  };

  const handleApply = () => {
    if (discount) return;
    if (applycode) {
      setDiscount(true);
      timeout = setTimeout(() => {
        setDiscount(false);
      }, 3000);
    }
  };

  const getOriginalPrice = () => {
    if (current_rank?.rank) {
      let price =
        current_rank?.rank?.price?.place[`${current_rank?.server?.type}`][
          current_rank?.division?._id
        ];
      return price;
    }
    return 0;
  };

  const calcTotalPrice = () => {
    let price = getOriginalPrice();
    // if (current_rank?.current_lp) {
    //   price *= current_rank?.current_lp?.rate;
    // }
    price *= placement_match;

    // extra features
    let extra_price = 0;
    extraFeatures.map((d: any) => {
      if (d.apply) {
        extra_price += d.rate * price;
      }
    });

    if (current_rank?.agents?.length) {
      price += price * 0.2;
    }

    price += extra_price;

    if (discount) {
      price -= price * 0.2;
    }

    setPrice(Math.round(price * 100) / 100);
  };

  useEffect(() => {
    calcTotalPrice();
  }, [current_rank, placement_match, server, extraFeatures, discount]);

  const handleBuyBoost = () => {
    // decide user login or not
    // dispatch(setLoginModal(true));
    dispatch(setCheckoutModal(true));
  };

  return (
    <div className="border border-indigo-800 p-4 rounded-lg">
      <div className="text-center mb-2">
        <span className="text-xl">Checkout</span>
        <p className="text-gray-500">Add extra options to your boost.</p>
      </div>
      <div className="border-t border-b border-indigo-800 py-4">
        <div className="flex justify-center items-center gap-6">
          <div className="flex items-center gap-1">
            {current_rank && (
              <img className="w-6" src={current_rank?.rank?.url} alt="ICO" />
            )}
            {current_rank?.rank?.title || ""}{" "}
            {!current_rank?.rank?.level
              ? current_rank?.division?.mark
              : `${current_rank?.lp} LP`}
          </div>
          <FaArrowRight />
          <div className="flex items-center gap-1">
            {placement_match} <span className="text-gray-400">Matches</span>
          </div>
        </div>
      </div>
      <div className="space-y-4 py-4">
        <div className="flex justify-between">
          <div className="flex gap-2 items-center">
            <span>Agents</span>
            <span
              className={`${"text-green-500 border-green-500"} border rounded-xl  px-2 text-sm`}
            >
              Free
            </span>
          </div>
          <button
            className={`px-2 py-1 text-xs bg-indigo-800 rounded-xl hover:bg-indigo-500`}
            onClick={() => setisOpenAgentModal(true)}
          >
            Pick
          </button>
        </div>

        {Array.isArray(extra_features) &&
          extraFeatures?.map((d: any, index: number) => (
            <div
              key={index}
              className="flex justify-between items-center text-gray-300"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold">{d.title}</span>
                <span
                  className={`${
                    d.rate == 0
                      ? "text-green-500 border-green-500"
                      : "text-indigo-500 border-indigo-500"
                  } border rounded-xl  px-2 text-sm`}
                >
                  {d.rate == 0 ? "Free" : `${100 * d.rate}%`}
                </span>
              </div>
              <ToggleSwitch
                sizing="sm"
                label=""
                checked={d.apply}
                onChange={() => {
                  let temp = [...extraFeatures];
                  temp[index] = { ...temp[index], apply: !d.apply };
                  setExtraFeatures(temp);
                }}
                color="indigo"
                theme={{
                  toggle: {
                    checked: {
                      on: "after:translate-x-full after:border-indigo-900 rtl:after:-translate-x-full",
                      off: "border-indigo-900 bg-transparent dark:border-indigo-600 dark:bg-indigo-700",
                    },
                  },
                }}
              />
            </div>
          ))}
      </div>
      <div className="border-t border-b border-indigo-800 py-4 flex justify-center items-center gap-2">
        <FaTimesCircle />
        <span className="text-gray-500"> Completion Time: </span>
        <b>~1 day</b>
      </div>
      <div className="py-4">
        {!discount ? (
          <div className="flex flex-col gap-2">
            <label htmlFor="" className="text-sm text-gray-500">
              Discount Code
            </label>
            <div className=" flex items-center gap-2 justify-between">
              <input
                className="px-3 py-1 w-full rounded-md text-sm bg-indigo-950"
                placeholder="Enter Code BOOST20 to get a 20% discount"
                name="applycode"
                onChange={handleChange}
              />
              <button
                className="px-3 py-1 bg-indigo-800 text-sm rounded-md"
                onClick={handleApply}
              >
                Apply
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 text-center py-4 px-6 border-green-600 border rounded-lg bg-gradient-to-b from-green-900 to-green-[#ddd] relative text-green-400">
            -20% discount applied successfully 🎉
            <button
              className="absolute top-1/2 right-[10px] hover:text-green-300 -translate-x-1/2 -translate-y-1/2"
              onClick={() => setDiscount(false)}
            >
              <FaTimes />
            </button>
          </div>
        )}
      </div>
      <div className="pb-4">
        <div className="flex justify-between items-center">
          <label htmlFor="" className=" text-gray-500">
            Total Price
          </label>
          <span className="text-2xl font-bold">{price}€</span>
        </div>
        <button
          className={`w-full py-2 mt-4 flex items-center gap-4 justify-center rounded-lg ${classNames.btnClass}`}
          onClick={handleBuyBoost}
        >
          Buy Boost <FaArrowRight />
        </button>
      </div>
      {/* Agent Modal */}
      <ModalAgent
        open={isOpenAgentModal}
        agents={current_rank?.agents}
        setAgents={(agents) => dispatch(setAgents(agents))}
        setOpen={setisOpenAgentModal}
      />
    </div>
  );
};
export default Checkout;
