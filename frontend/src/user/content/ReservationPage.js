import React, { useEffect, useState } from 'react';
import CarList from './CarList';
import './ReservationPage.css';
import axios from 'axios';
import CarSearchFilter from './CarSearchFilter';
import ReservationCalender from './ReservationCalender';
import SelectBranch from './SelectBranch';

const RentalCarsPage = () => {
  const [filtersState, setFiltersState] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const [branchs, setBranch] = useState([]);
  const [isSelectBranch, setIsSelectBranch] = useState(false);
  const [isSelectRegion, setIsSelectRegion] = useState(false);
  const [selectRegion, setSelectRegion] = useState('');
  const [selectBranch, setSelectBranch] = useState('');
  const [isSelectPeriod, setIsSelectPeriod] = useState(true);
  const [isSelected, setIsSelected] = useState(false);
  const [rentalPeriod, setRentalPeriod] = useState([]);
  const [rentalperiod, setRentalperiod] = useState(5);
  const [rentalTime, setRentalTime] = useState([]);

  const filters = [
    {
      id: "regions",
      label: "지역",
      api: `${process.env.REACT_APP_API_URL}/arentcar/user/cars/regions`,
      displayKey: "region_name",
    },
    {
      id: "branchName",
      label: "지점",
      api: `${process.env.REACT_APP_API_URL}/arentcar/user/cars/branchs`,
      displayKey: "branch_name",
    },
    {
      id: "fuelType",
      label: "연료 타입",
      api: `${process.env.REACT_APP_API_URL}/arentcar/user/cars/filter/fueltype`,
      displayKey: "fuel_type",
    },
    {
      id: "carTypeCategory",
      label: "차종",
      api: `${process.env.REACT_APP_API_URL}/arentcar/user/cars/filter/cartypecategory`,
      displayKey: "car_type_category",
    },
    {
      id: "carManufacturer",
      label: "제조사",
      api: `${process.env.REACT_APP_API_URL}/arentcar/user/cars/filter/carmanufacturer`,
      displayKey: "car_manufacturer",
    },
    {
      id: "seatingCapacity",
      label: "인승구분",
      api: `${process.env.REACT_APP_API_URL}/arentcar/user/cars/filter/seatingcapacity`,
      displayKey: "seating_capacity",
    },
  ];


  useEffect(() => {
    const fetchFilters = async () => {
      const newFiltersState = {};

      await Promise.all(
        filters.map(async (filter) => {
          try {
            const response = await axios.get(filter.api);
            newFiltersState[filter.id] = response.data;
          } catch (error) {
            console.error(`Error fetching ${filter.label}:`, error);
          }
        })
      );

      setFiltersState(newFiltersState);
    };

    fetchFilters();

        
  }, []);

  useEffect(()=>{
                    // 날짜를 밀리초 단위로 변환하는 함수
function dateToMilliseconds(dateString) {
  const year = Number(dateString.substring(0, 4));
  const month = Number(dateString.substring(4, 6)) - 1; // 월은 0부터 시작
  const day = Number(dateString.substring(6, 8));
  return new Date(year, month, day).getTime();
}

// 렌탈 기간 계산 함수
function calculateRentalPeriod(rentalDate, returnDate) {
  const startMilliseconds = dateToMilliseconds(rentalDate);
  const endMilliseconds = dateToMilliseconds(returnDate);

  // 밀리초 차이를 일 단위로 변환
  const millisecondsInADay = 24 * 60 * 60 * 1000;
  const rentalDays = (endMilliseconds - startMilliseconds) / millisecondsInADay;

  return rentalDays;
}
    if(rentalPeriod.length>0){
      setRentalperiod(calculateRentalPeriod(rentalPeriod[0].getFullYear().toString() + (rentalPeriod[0].getMonth() + 1).toString() + rentalPeriod[0].getDate().toString(),rentalPeriod[1].getFullYear().toString() + (rentalPeriod[1].getMonth() + 1).toString() + rentalPeriod[1].getDate().toString()));
    }
  },[rentalPeriod])

  const handleFilterChange = (id, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleResetFilter = () => {
    setSelectedFilters({
      'branchName': selectBranch,
      'rentalDate': rentalPeriod[0].getFullYear().toString() + (rentalPeriod[0].getMonth() + 1).toString() + rentalPeriod[0].getDate().toString(),
      'returnDate': rentalPeriod[1].getFullYear().toString() + (rentalPeriod[1].getMonth() + 1).toString() + rentalPeriod[1].getDate().toString(),
      'rentalTime': rentalTime[0].toString().padStart(2, '0'),
        'returnTime': rentalTime[1].toString().padStart(2, '0'),
        'rentalperiod': rentalperiod
    });
  }
  const hendelSelectRegion = (region) => {
    setSelectRegion(region);
    setIsSelectRegion(true);
  }

  const hendelSelectBranch = (branchName) => {
    setSelectBranch(branchName);
    setIsSelectBranch(true);
    setIsSelectPeriod(false);
  }
  const hendelResetBranch = () => {
    setSelectBranch('');
    setRentalPeriod([])
    setIsSelectBranch(false);
    setIsSelectPeriod(true);
    setIsSelected(false);
    setIsSelectRegion(false);
  }
  const hendelSelectPeriod = () => {
    if (selectBranch !== '' && rentalPeriod.length !== 0) {
      setIsSelectBranch(true);
      setIsSelectPeriod(true);
      setIsSelected(true);
      setSelectedFilters({
        'branchName': selectBranch,
        'rentalDate': rentalPeriod[0].getFullYear().toString() + (rentalPeriod[0].getMonth() + 1).toString().padStart(2, '0') + rentalPeriod[0].getDate().toString().padStart(2, '0'),
        'returnDate': rentalPeriod[1].getFullYear().toString() + (rentalPeriod[1].getMonth() + 1).toString().padStart(2, '0') + rentalPeriod[1].getDate().toString().padStart(2, '0'),
        'rentalTime': rentalTime[0].toString().padStart(2, '0'),
        'returnTime': rentalTime[1].toString().padStart(2, '0'),
        'rentalperiod': rentalperiod
      });
    } else {
      alert('대여 장소와 기간을 선택해 주세요.');
    }

  }
  useEffect(() => {
    const fetchBranchs = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/user/cars/selected/region/branchs`, {
          params: { region: selectRegion },
        });
        if (response.data) {
          setBranch(response.data);
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request canceled:', error.message);
        } else {
          console.error('There was an error fetching the cars!', error);
        }
      }
    };

    fetchBranchs();
  }, [selectRegion]);

  const onRentalPeriod = (rentalDate, returnDate, rentalTime, returnTime) => {
    setRentalPeriod([rentalDate, returnDate]);
    setRentalTime([rentalTime, returnTime])
  }

  return (
    <div className="rental-cars-page-wrap">
      <SelectBranch branchName={selectBranch} hendelResetBranch={hendelResetBranch} hendelSelectPeriod={hendelSelectPeriod} rentalPeriod={rentalPeriod}></SelectBranch>
      {!isSelectBranch &&
        <div className='rental-cars-page-select-branch-wrap'>
          <div className='rental-cars-page-select-branch-title'>대여 장소를<br />선택해 주세요</div>
          <div className='rental-cars-page-select-branch-regions-wrap'>
            {(filtersState.regions || []).map((region) => (
              <div key={region.region_name} className='rental-cars-page-select-branch-regions-item' onClick={() => hendelSelectRegion(region.region_name)}>
                {region.region_name}
              </div>
            ))}
          </div>
          <div className='rental-cars-page-select-branch-item'>
            {isSelectRegion && (branchs || []).map((branch) => (
              <div key={branch.branch_name} className='rental-cars-page-select-branch-name' onClick={() => hendelSelectBranch(branch.branch_name)}>
                {branch.branch_name}
              </div>
            ))}
          </div>
        </div>
      }
      {!isSelectPeriod &&
        <ReservationCalender onRentalPeriod={onRentalPeriod}></ReservationCalender>
      }
      {isSelected &&
        <>
          <div className="rental-cars-page-header-wrap">
            <h2 className="rental-cars-page-header-title">단기렌트카</h2>
          </div>
          <div className="rental-cars-page-content-wrap">
            <CarList {...selectedFilters} />
            <div className="rental-cars-page-content-filter-wrap">
              <h3 className='rental-cars-page-content-filter-title'>검색옵션 선택</h3>
              {filters
                .filter((filter) => filter.label !== '지역') // '지역'을 제외
                .map((filter) => (
                  <CarSearchFilter
                    key={filter.id}
                    label={filter.label}
                    optionList={filtersState[filter.id] || []}
                    selectedOption={selectedFilters[filter.id]}
                    displayKey={filter.displayKey}
                    onOptionClick={(value) => handleFilterChange(filter.id, value)}
                  />
                ))}

              <button className='rental-cars-page-content-filter-reset-button' onClick={handleResetFilter}>초기화</button>
            </div>
          </div>
        </>
      }


    </div>
  );
};

export default RentalCarsPage;
