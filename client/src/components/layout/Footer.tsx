// src/components/layout/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-secondary text-white pt-10 pb-6">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Thông tin công ty */}
                    <div>
                        <h4 className="text-xl font-bold mb-4">CinemaHub</h4>
                        <p className="text-gray-300 mb-2">
                            Hệ thống rạp chiếu phim hàng đầu Việt Nam
                        </p>
                        <div className="flex items-center mt-4">
                            <a href="#" className="text-gray-300 hover:text-primary mr-4">
                                <span className="sr-only">Facebook</span>
                                <svg
                                    className="h-6 w-6"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-300 hover:text-primary mr-4">
                                <span className="sr-only">Instagram</span>
                                <svg
                                    className="h-6 w-6"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-300 hover:text-primary">
                                <span className="sr-only">YouTube</span>
                                <svg
                                    className="h-6 w-6"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Link hữu ích */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Liên kết</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-gray-300 hover:text-primary">
                                    Trang chủ
                                </Link>
                            </li>
                            <li>
                                <Link to="/movies" className="text-gray-300 hover:text-primary">
                                    Phim đang chiếu
                                </Link>
                            </li>
                            <li>
                                <Link to="/movies/coming-soon" className="text-gray-300 hover:text-primary">
                                    Phim sắp chiếu
                                </Link>
                            </li>
                            <li>
                                <Link to="/cinemas" className="text-gray-300 hover:text-primary">
                                    Hệ thống rạp
                                </Link>
                            </li>
                            <li>
                                <Link to="/promotions" className="text-gray-300 hover:text-primary">
                                    Khuyến mãi
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Thông tin liên hệ */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Liên hệ</h4>
                        <ul className="space-y-2">
                            <li className="flex items-start">
                                <svg
                                    className="h-6 w-6 text-gray-300 mr-2"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                <span className="text-gray-300">
                  123 Đường Láng, Hà Nội, Việt Nam
                </span>
                            </li>
                            <li className="flex items-center">
                                <svg
                                    className="h-6 w-6 text-gray-300 mr-2"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                </svg>
                                <span className="text-gray-300">0123 456 789</span>
                            </li>
                            <li className="flex items-center">
                                <svg
                                    className="h-6 w-6 text-gray-300 mr-2"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                                <span className="text-gray-300">support@cinemahub.vn</span>
                            </li>
                        </ul>
                    </div>

                    {/* Ứng dụng di động */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Tải ứng dụng</h4>
                        <p className="text-gray-300 mb-4">
                            Tải ứng dụng CinemaHub để đặt vé nhanh chóng và nhận nhiều ưu đãi hơn
                        </p>
                        <div className="space-y-2">
                            <a
                                href="#"
                                className="flex items-center bg-black text-white rounded-lg px-4 py-2 w-36 hover:bg-gray-800"
                            >
                                <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.5575 12.6783C17.5194 9.53982 20.0625 8.12457 20.1948 8.04152C18.6296 5.76328 16.1722 5.48538 15.3159 5.46332C13.2212 5.24652 11.1998 6.71887 10.1392 6.71887C9.05561 6.71887 7.42561 5.48538 5.64687 5.52949C3.40382 5.57363 1.29775 6.86222 0.166895 8.83738C-2.1451 12.8336 -0.436977 18.7677 1.78873 21.8413C2.89166 23.3547 4.17903 25.0401 5.88103 24.9739C7.53873 24.902 8.19189 23.917 10.1834 23.917C12.1517 23.917 12.7605 24.9739 14.4957 24.9365C16.2841 24.902 17.3791 23.4032 18.4384 21.8784C19.6948 20.1493 20.1948 18.4515 20.2175 18.3633C20.1716 18.3486 17.5992 17.2822 17.5575 12.6783"></path>
                                </svg>
                                <div>
                                    <div className="text-xs">Tải về từ</div>
                                    <div className="text-sm font-semibold font-sans">App Store</div>
                                </div>
                            </a>
                            <a
                                href="#"
                                className="flex items-center bg-black text-white rounded-lg px-4 py-2 w-36 hover:bg-gray-800"
                            >
                                <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3.66235 2.85517C3.37955 3.14369 3.38516 3.75131 3.38516 4.34213V19.6685C3.38516 20.2533 3.37955 20.8563 3.66235 21.1503L3.7381 21.2261C4.44832 21.9419 5.63938 21.4013 6.63537 20.8256L15.1636 15.9859C15.961 15.5146 16.9125 14.9609 16.9125 14.0053C16.9125 13.0498 15.961 12.4961 15.1636 12.0192L6.63537 7.17943C5.63938 6.60932 4.44832 6.06303 3.7381 6.77887L3.66235 2.85517Z" fill="#EA4335" />
                                    <path d="M16.9125 14.0053C16.9125 14.9609 15.9611 15.5146 15.1637 15.9859L6.63537 20.8256C5.63939 21.4013 4.44833 21.942 3.7381 21.2262L14.2629 14.0053L3.7381 6.77895C4.44833 6.06311 5.63939 6.6094 6.63537 7.17951L15.1637 12.0193C15.9611 12.4962 16.9125 13.0498 16.9125 14.0053Z" fill="#FBBC04" />
                                    <path d="M3.66246 21.1503C4.03922 21.5333 4.66364 21.5333 5.3795 21.2393L5.41853 21.2169L16.0247 15.2097C16.3788 14.9886 16.6728 14.7181 16.9125 14.0053L6.31946 6.75104L5.3795 6.77105C4.66364 6.47693 4.03922 6.47693 3.66246 6.85986C3.37966 7.14839 3.38527 7.75601 3.38527 8.34683V19.6686C3.38527 20.2539 3.37966 20.8618 3.66246 21.1503Z" fill="#4285F4" />
                                    <path d="M5.3794 6.77113L16.0246 14.0054C16.3787 14.7181 16.6727 14.9887 16.9124 15.2098L5.3794 6.77113Z" fill="#34A853" />
                                </svg>
                                <div>
                                    <div className="text-xs">GET IT ON</div>
                                    <div className="text-sm font-semibold font-sans">Google Play</div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-8 pt-8 text-center">
                    <p className="text-sm text-gray-400">
                        &copy; {new Date().getFullYear()} CinemaHub. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;