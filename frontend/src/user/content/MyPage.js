import React, { useEffect, useState } from 'react';
import 'user/content/MyPage.css';
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import axios from "axios";
import { refreshAccessToken, handleLogout, formatDate, formatTime, formatPhone } from "common/Common";


const MyPage = () => {
  const isUserName = useSelector((state) => state.userState.userName);
  const userCode = useSelector((state) => state.userState.userCode);
  const navigate = useNavigate();
  const [isPopUp, setIsPopUp] = useState(false);
  const [branchNames, setBranchNames] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedReservationDate, setSelcetedreservationDate] = useState("");
  // const [reserverName, setReserverName] = useState("");
  const [pageNumber, setPageNumber] = useState(1); // 현재 페이지 번호
  const pageSize = 5; // 한 페이지에 보여줄 데이터 개수
  const [totalCount, setTotalCount] = useState(0); // 전체 페이지 수
  const [myreservations, setMyReservations] = useState([]);
  const [myReservationDetails, setMyReservationDetails] = useState([]);
  const [columnDefs] = useState([
    { titlename: "예약ID", field: "reservation_code", width: 100, align: "center" },
    { titlename: "예약일", field: "reservation_date", width: 150, align: "center" },
    { titlename: "대여일", field: "rental_date", width: 120, align: "center" },
    { titlename: "대여지점", field: "rental_location_name", width: 100, align: "center" },
    { titlename: "반납일", field: "return_date", width: 120, align: "center" },
    { titlename: "반납지점", field: "return_location_name", width: 100, align: "center" },
    { titlename: "차종", field: "car_type_name", width: 100, align: "center" },
    { titlename: "결제일", field: "payment_date", width: 150, align: "center" },
    { titlename: "예약상태", field: "reservation_status", width: 100, align: "center" },
    { titlename: "", field: "", width: 100, align: "center" },
  ]);

  // YYYY-MM-DD → YYYYMMDD 변환 함수
  const formatDateToCompact = (date) => {
    if (!date) {
      return ""; // 날짜가 없으면 빈 문자열 반환
    }
    return date.replace(/-/g, ""); // "-"를 제거하여 반환
  };

  const formatNumberWithCommas = (number) => {
    if (!number && number !== 0) {
      return ""; // 숫자가 없으면 빈 문자열 반환
    }
    return `${number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원`;
  };
  const pagingMyReservations = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await getMyReservations(token);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        try {
          const newToken = await refreshAccessToken();
          await getMyReservations(newToken);
        } catch (error) {
          alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
          handleLogout();
        }
      } else {
        console.error('There was an error fetching the reservations pageing!', error);
      }
    }
  };

  const getMyReservations = async (token) => {
    const params = {
      pageSize,
      pageNumber,
      userCode,
    };
    console.log(params);
    // 조건이 참일 때만 필드 추가
    console.log("Fetching My Reservations with params:", params); // 디버깅: 요청 파라미터
    console.log("API URL:", `${process.env.REACT_APP_API_URL}/arentcar/manager/myreservations`); // 디버깅: API URL

    if (selectedBranch && selectedBranch.trim() !== '') {
      params.rentalLocationName = selectedBranch;
    }
    if (selectedReservationDate) {
      params.reservationDate = formatDateToCompact(selectedReservationDate);
    }

    const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/myreservations`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true,
      });

    if (response.data && response.data.length > 0) {
      setMyReservations(response.data); // 데이터가 있는 경우
    } else {
      setMyReservations([]); // 데이터가 없는 경우 빈 배열로 설정
      console.log("No data found for the given conditions.");
    }
  };

  const getTotalCount = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await getCount(token);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        try {
          const newToken = await refreshAccessToken();
          await getCount(newToken);
        } catch (error) {
          alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
          handleLogout();
        }
      } else {
        console.error('There was an error fetching the Reservations count!', error);
      }
    }
  };

  const getCount = async (token) => {
    const params = {
      userCode,
      ...((selectedBranch && { rentalLocationName: selectedBranch }) || {}),
      ...((selectedReservationDate && { reservationDate: formatDateToCompact(selectedReservationDate) }) || {}),
    };
    console.log("Params sent to API:", params);
    console.log("Fetching Total Count with params:", params); // 디버깅: 요청 파라미터
    console.log("API URL:", `${process.env.REACT_APP_API_URL}/arentcar/manager/myreservations/count`); // 디버깅: API URL


    const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/manager/myreservations/count`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true,
      });

    if (typeof response.data === 'number') {
      setTotalCount(response.data);
      console.log("Total Count:", totalCount);
      console.log("Total Pages:", totalPages);
    } else {
      console.error('Unexpected response:', response.data);
    }
  };

  const handlePageChange = (newPageNumber) => {
    setPageNumber(newPageNumber);
  };

  // 검색 조건 변경 후 초기화 코드
  const handleSearchClick = async () => {
    console.log("Selected Branch:", selectedBranch);
    console.log("Selected Reservation Date:", selectedReservationDate);
    setPageNumber(1);
    await pagingMyReservations();
    await getTotalCount();
  };

  let totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;

  const handleFetchBranchNames = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/arentcar/user/branches`);
      if (response.data) {
        setBranchNames(response.data.map((branch) => branch.branch_name));
      }
    } catch (error) {
      console.error("There was an error fetching the branches", error);
    }
  };
  useEffect(() => {
    handleFetchBranchNames();
  }, []);

  useEffect(() => {
    pagingMyReservations();
    getTotalCount();
  }, [pageNumber]);

  const handleFetchMyReservationDetail = async (reservationCode, userCode) => {
    console.log("fetchMyReservationDetail called with:", { reservationCode, userCode });
    if (!reservationCode || !userCode) {
      console.error("Invalid reservationCode or userCode");
      return; // 값이 없으면 중단
    }
    try {
      const token = localStorage.getItem("accessToken");
      console.log("Access token retrieved:", token);
      await getMyReservationDetails(token, reservationCode, userCode);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        try {
          const newToken = await refreshAccessToken();
          await getMyReservationDetails(newToken, reservationCode, userCode);
        } catch (error) {
          alert("인증이 만료되었습니다. 다시 로그인 해주세요.");
          handleLogout();
        }
      } else {
        console.error("There was an error fetching the reservation details!", error);
      }
    }
  };
  const getMyReservationDetails = async (token, reservationCode, userCode) => {

    if (!reservationCode || !userCode) {
      return;
    }

    const params = {
      reservationCode,
      userCode,
    };

    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/arentcar/manager/myreservations/detail`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );

    if (response.data) {
      setMyReservationDetails(response.data);
    }
  };


  const handleButtonNavigation = (path) => {
    navigate(path);
  };

  const handleDetailClick = (reservationCode, userCode) => {
    setIsPopUp(true);
    handleFetchMyReservationDetail(reservationCode, userCode);
  };



  const handlePopupClodeClick = () => {
    setIsPopUp(false);
    setMyReservationDetails([]);
  };

  const handleMyReservationCancel = async () => {
    // 예약 취소 여부 확인
    const MyreservationCancelConfirmed = window.confirm("정말로 예약을 취소하시겠습니까?");
    if (!MyreservationCancelConfirmed) {
      alert("예약이 정상적으로 유지되었습니다.");
      return;
    }else{
      alert("예약이 정상적으로 취소되었습니다."); // 성공 메시지
    }
  };

  return (
    <div className="my-page-wrap">
      <div className="my-page-content-wrap">
        <div className="my-page-content-header-wrap">
          <h2 className="my-page-content-header-title">마이페이지</h2>
        </div>
        <div className="my-page-content-body-wrap">
          <div className="my-page-body-profile-wrap">
            <div className="my-page-profile-info-wrap">
              <div className="my-page-profile-info-text">
                <p className='my-page-profile-info-text-title'><strong>{isUserName}님</strong> 반갑습니다.</p>
                <p className='my-page-profile-info-text-sub'>항상 A렌트카와 함께해 주셔서 감사합니다.</p>
              </div>
              <button className="my-page-profile-info-button mypage-button">내 정보 관리</button>
            </div>
          </div>
          <div className="my-page-body-reservation-wrap">
            <div className="my-page-reservation-header-wrap">
              <p className="my-page-reservation-title">나의 렌트현황</p>
              <button className="my-page-reservationpage-button mypage-button" onClick={() => handleButtonNavigation("/reservation")}>렌트카 예약하기</button>
            </div>
            <div className="my-page-reservation-list-wrap">
              <div className="my-page-reservation-data-list">
                <div className='my-page-reservation-data-list-search-wrap'>

                  <input type="date"
                    placeholder="예약일"
                    value={selectedReservationDate}
                    onChange={(e) => setSelcetedreservationDate(e.target.value)}
                  />
                  <select
                    className="my-page-reservation-select"
                    value={selectedBranch} // 선택된 값
                    onChange={(e) => setSelectedBranch(e.target.value)} // 선택값 변경
                  >
                    <option value="">대여지점</option>
                    {branchNames.map((branch, index) => (
                      <option key={index} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSearchClick}>
                    검색
                  </button>
                </div>
                <div className="my-page-reservation-data-column">
                  <ul className='my-page-reservation-data-column-title-ul'>
                    {columnDefs.map((title, index) => (
                      <li
                        key={index}
                        className="my-page-reservation-data-column-title-li"
                        style={{
                          width: `${title.width}px`,
                          textAlign: title.align,
                        }}
                      >
                        {title.titlename}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* 테이블 데이터 */}
                <div className="my-page-reservation-data-column">
                  {myreservations.length > 0 ? (
                    myreservations.map((myreservations, index) => (
                      <ul key={index} className="my-page-reservation-data-column-title-ul">
                        {columnDefs.map((column, colIndex) => (
                          <li
                            key={colIndex}
                            className="my-page-reservation-data-column-title-li"
                            style={{
                              width: `${column.width}px`,
                              textAlign: column.align || "center",
                            }}
                          >
                            {column.field === "" ? (
                              <button
                                className="my-page-reservation-data-button-detail"
                                onClick={() => handleDetailClick(myreservations.reservation_code, userCode)}
                              >
                                상세보기
                              </button>
                            ) : (
                              column.field === "rental_date" ? (
                                formatDate(myreservations[column.field])
                              ) : column.field === "return_date" ? (
                                formatDate(myreservations[column.field])
                              ) : column.field === "reservation_date" ? (
                                formatDate(myreservations[column.field])
                              ) : column.field === "payment_date" ? (
                                formatDate(myreservations[column.field])
                              ) :
                                myreservations[column.field]
                            )}
                          </li>
                        ))}
                      </ul>
                    ))
                  ) : (
                    <div className="my-page-reservation-no-data">
                      조건에 맞는 렌트내역이 없습니다.
                    </div>
                  )}
                </div>

                <div className="my-page-reservation-bottom-pagination-wrap ">
                  <button
                    className="my-page-reservation-pagination-button"
                    style={{ color: pageNumber === 1 ? "#aaa" : "rgb(38, 49, 155)", width: "15px", }}
                    onClick={() => handlePageChange(pageNumber - 1)}
                    disabled={pageNumber === 1}
                  >
                    &lt;
                  </button>
                  <div className="manager-reservation-pagination-info">
                    {pageNumber} / {totalPages}
                  </div>
                  <button
                    className="my-page-reservation-pagination-button"
                    style={{ color: pageNumber === totalPages ? "#aaa" : "rgb(38, 49, 155)", width: "15px", }}
                    onClick={() => handlePageChange(pageNumber + 1)}
                    disabled={pageNumber === totalPages}
                  >
                    &gt;
                  </button>
                </div>
                {/* 상세 팝업 */}

                {isPopUp && (
                  <div className="my_page_reservation_popup my_page_popup manager-popup">
                    <div className="my_page_reservation_content_popup_wrap">
                      <div className="my_page_reservation_content_popup_header_wrap">
                        <div className="my_page_popup_title">렌탈 상세내역</div>
                        <button
                          className="my_page_button my_page_button_close"
                          onClick={handlePopupClodeClick}
                        >
                          닫기
                        </button>
                      </div>

                      {/* 예약 코드 */}
                      <div className="my_page_reservation_popup_high_reservation_id">
                        <label>예약ID : </label>
                        <span>{' '}{myReservationDetails?.reservation_code}</span>
                      </div>

                      {/* 예약 정보 */}
                      <div className="my_page_reservation_popup_section">
                        <div className="my_page_reservation_popup_section_title">예약정보</div>
                        <div className="my_page_reservation_popup_field_row">
                          <label>예약ID : </label>
                          <span>{myReservationDetails?.reservation_code}</span>
                          <label>예약일 : </label>
                          <span>{formatDate(myReservationDetails?.reservation_date)}</span>
                        </div>
                        <div className="my_page_reservation_popup_field_row">
                          <label>예약자 : </label>
                          <span>{myReservationDetails?.user_name}</span>
                          <label>연락처 : </label>
                          <span>{formatPhone(myReservationDetails?.user_phone_number)}</span>
                        </div>
                      </div>

                      {/* 차량 정보 */}
                      <div className="my_page_reservation_popup_section">
                        <div className="my_page_reservation_popup_section_title">차량정보</div>
                        <div className="my_page_reservation_popup_field_row">
                          <label>차량명 : </label>
                          <span>{myReservationDetails?.car_type_name}</span>
                          <label>연식 : </label>
                          <span>{myReservationDetails?.model_year}년식</span>
                        </div>
                        <div className="my_page_reservation_popup_field_row">
                          <label>인승 : </label>
                          <span>{myReservationDetails?.seating_capacity}</span>
                          <label>연료 : </label>
                          <span>{myReservationDetails?.fuel_type}</span>
                        </div>
                        <div className="my_page_reservation_popup_field_row">
                          <label>보험 : </label>
                          <span>{myReservationDetails?.insurance_type}</span>
                        </div>
                        <div className="my_page_reservation_popup_field_row">
                          <label>특이사항 </label>
                          <span>
                            {`면허제한 : ${myReservationDetails?.license_restriction || "없음"}, 속도제한 : ${myReservationDetails?.speed_limit || "없음"}`}
                          </span>
                        </div>
                      </div>

                      <div className="my_page_reservation_popup_section">
                        <div className="my_page_reservation_popup_section_title">이용지점</div>
                        <div className="my_page_reservation_popup_field_row">
                          <label>대여일 : </label>
                          <span>{formatDate(myReservationDetails?.rental_date)} {formatTime(myReservationDetails?.rental_time) || ""}</span>
                          <label>대여지점 : </label>
                          <span>{myReservationDetails?.rental_branch_name}</span>
                        </div>
                        <div className="my_page_reservation_popup_field_row">
                          <label>주소 : </label>
                          <span>{myReservationDetails?.rental_branch_address}</span>
                          <label>연락처 : </label>
                          <span>{myReservationDetails?.rental_branch_phone_number}</span>
                        </div>
                        <div className="my_page_reservation_popup_field_row">
                          <label>반납일 : </label>
                          <span>{formatDate(myReservationDetails?.return_date)} {formatTime(myReservationDetails?.return_time) || ""}</span>
                          <label>반납지점 : </label>
                          <span>{myReservationDetails?.return_branch_name}</span>
                        </div>
                        <div className="my_page_reservation_popup_field_row">
                          <label>주소 : </label>
                          <span>{myReservationDetails?.return_branch_address}</span>
                          <label>연락처 : </label>
                          <span>{myReservationDetails?.return_branch_phone_number}</span>
                        </div>
                      </div>

                      {/* 결제 정보 */}
                      <div className="my_page_reservation_popup_section">
                        <div className="my_page_reservation_popup_section_title">결제정보</div>
                        <div className="my_page_reservation_popup_field_row">
                          <label>결제일 : </label>
                          <span>{formatDate(myReservationDetails?.payment_date)}</span>
                          <label>결제상태 : </label>
                          <span>{myReservationDetails?.payment_status}</span>
                        </div>
                        <div className="my_page_reservation_popup_field_row">
                          <label>결제금액 : </label>
                          <span>{formatNumberWithCommas(myReservationDetails?.payment_amount)}</span>
                        </div>
                        <div className="my_page_reservation_popup_field_row">
                          <label>결제방식 : </label>
                          <span>
                            {myReservationDetails?.payment_category || "정보 없음"} / {myReservationDetails?.payment_type || "정보 없음"}
                          </span>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="my_page_reservation_content_popup_footer_wrap">
                        <button
                          className="my_page_reservation_content_popup_footer_cancel"
                          onClick={handleMyReservationCancel}
                        >
                          예약취소
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
