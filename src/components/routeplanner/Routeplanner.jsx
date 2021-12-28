import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { search, saveSearchHistory } from "../../services/Api";
import Button from "react-bootstrap/Button";
import LoadingIndicator from "../partials/LoadingIndicator";
import SelectLocationField from "./SelectLocationField";
import SearchResults from "./SearchResults";
import ShowErrorMsgModal from "./ShowErrorMsgModal";
import TimeOptions from "./TimeOptions";
import useAuthContext from "../../hooks/useAuthContext";

const Routeplanner = () => {
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchDetails, setSearchDetails] = useState(null);
  const [selectFrom, setSelectFrom] = useState(null);
  const [selectTo, setSelectTo] = useState(null);
  const [showModal, setShowModal] = useState(null);
  const [travelTimeOption, setTravelTimeOption] = useState(null);

  const selectProps = { setSelectFrom, setSelectTo };

  const { accessToken, currentUser, refreshUser } = useAuthContext();

  const { data, isFetching, refetch } = useQuery(
    [`get-search-results`],
    async () => await search(searchDetails, accessToken)
  );

  useEffect(() => {
    refetch();

    if (searchDetails) {
      saveUserSearchHistoryLocations();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDetails]);

  const saveUserSearchHistoryLocations = async () => {
    const response = await saveSearchHistory(
      {
        search_history: { from: selectFrom?.data, to: selectTo?.data },
      },
      accessToken
    );

    return refreshUser(response.data);
  };

  const handleSearch = () => {
    // checks if all required fields are filled in.
    if (!selectFrom) {
      setShowModal(true);
      return setErrorMsg("You need to fill in where you want to leave.");
    }

    if (!selectTo) {
      setShowModal(true);
      return setErrorMsg("You need to fill in where you want to go.");
    }

    if (!travelTimeOption) {
      setShowModal(true);
      return setErrorMsg("You need to choose when you want to travel.");
    }

    // create new variable storing search details.
    const newSearchDetails = {
      from: selectFrom?.data?.id,
      to: selectTo?.data?.id,
      travelTimeOption,
    };

    return setSearchDetails(newSearchDetails);
  };
  return (
    <>
      <h2 className="h3 text-light py-3" id="routeplanner-heading">
        Plan your travel
      </h2>
      <p className="text-light">
        You can search between stops, addresses, or locations
      </p>

      <div className="my-4">
        <SelectLocationField
          accessToken={accessToken}
          name="From"
          searchHistory={currentUser?.search_history}
          select={selectProps}
          placeholder="From"
        />
      </div>

      <div className="my-4">
        <SelectLocationField
          accessToken={accessToken}
          name="To"
          searchHistory={currentUser?.search_history}
          placeholder="To"
          select={selectProps}
        />
      </div>

      <TimeOptions
        travelTimeOption={travelTimeOption}
        setTravelTimeOption={setTravelTimeOption}
      />

      <div className="d-flex justify-content-center my-5">
        <Button onClick={handleSearch} className="w-50" variant="dark">
          Search trip
        </Button>
      </div>

      {isFetching && <LoadingIndicator />}

      {!isFetching && data && (
        <SearchResults
          results={data?.data?.Trip}
          from={selectFrom?.label}
          to={selectTo?.label}
        />
      )}

      <ShowErrorMsgModal
        showModal={showModal}
        setShowModal={setShowModal}
        errorMsg={errorMsg}
        setErrorMsg={setErrorMsg}
      />
    </>
  );
};

export default Routeplanner;
