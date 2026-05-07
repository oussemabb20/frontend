import React from 'react';
import { Card, Stack, Grid } from '@mui/material';
import VuiBox from 'components/VuiBox';
import VuiTypography from 'components/VuiTypography';
import { IoCodeSlash, IoTrophy, IoFlash, IoTime } from 'react-icons/io5';
import linearGradient from 'assets/theme/functions/linearGradient';
import colors from 'assets/theme/base/colors';
import LineChart from 'examples/Charts/LineCharts/LineChart';
import { lineChartDataProfile1, lineChartDataProfile2 } from 'variables/charts';
import { lineChartOptionsProfile2, lineChartOptionsProfile1 } from 'variables/charts';
import CircularProgress from '@mui/material/CircularProgress';
import { useVisionUIController } from 'context';

const CarInformations = ({ user }) => {
  const [controller] = useVisionUIController();
  const { darkMode } = controller;
	const { gradients, info } = colors;
	const { cardContent } = gradients;
	const surfaceBg = darkMode
		? "linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)"
		: "linear-gradient(127.09deg, rgba(255, 255, 255, 0.98) 19.41%, rgba(241, 245, 249, 0.95) 76.65%)";
	const innerBoxBg = darkMode
		? linearGradient(cardContent.main, cardContent.state, cardContent.deg)
		: "linear-gradient(127.09deg, rgba(248, 250, 252, 0.98) 19.41%, rgba(226, 232, 240, 0.95) 76.65%)";
	
	// Calculate success rate percentage
	const successRate = user?.statistics?.successRate || 0;
	const totalPoints = user?.statistics?.totalPoints || 0;
	const challengesCompleted = user?.statistics?.challengesCompleted || 0;
	const currentStreak = user?.statistics?.currentStreak || 0;
	const level = user?.statistics?.level || 1;
	const xp = user?.statistics?.xp || 0;
	
	// Calculate time coding in hours
	const totalTimeCoding = user?.statistics?.totalTimeCoding || 0;
	const hoursSpent = Math.floor(totalTimeCoding / 3600);
	const minutesSpent = Math.floor((totalTimeCoding % 3600) / 60);

	return (
		<Card
			sx={({ breakpoints }) => ({
				background: surfaceBg,
				backdropFilter: "blur(42px)",
				border: darkMode ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(148, 163, 184, 0.35)",
				borderRadius: "20px",
				[breakpoints.up('xxl')]: {
					maxHeight: '400px'
				}
			})}>
			<VuiBox display='flex' flexDirection='column' p={3}>
				<VuiTypography variant='lg' color={darkMode ? 'white' : 'dark'} fontWeight='bold' mb='6px'>
					Coding Statistics
				</VuiTypography>
				<VuiTypography variant='button' color={darkMode ? 'text' : 'dark'} fontWeight='regular' mb='30px'>
					Hello, {user?.username || 'User'}! Your stats are ready.
				</VuiTypography>
				<Stack
					spacing='24px'
					sx={({ breakpoints }) => ({
						[breakpoints.up('sm')]: {
							flexDirection: 'column'
						},
						[breakpoints.up('md')]: {
							flexDirection: 'row'
						},
						[breakpoints.only('xl')]: {
							flexDirection: 'column'
						}
					})}>
					<VuiBox
						display='flex'
						flexDirection='column'
						justifyContent='center'
						sx={({ breakpoints }) => ({
							[breakpoints.only('sm')]: {
								alignItems: 'center'
							}
						})}
						alignItems='center'>
						<VuiBox sx={{ position: 'relative', display: 'inline-flex' }}>
							<CircularProgress 
								variant='determinate' 
								value={successRate} 
								size={170} 
								color='success'
								aria-label={`Success rate: ${successRate} percent`}
								aria-valuenow={successRate}
								aria-valuemin={0}
								aria-valuemax={100}
							/>
							<VuiBox 
								display='flex' 
								flexDirection='column' 
								justifyContent='center' 
								alignItems='center'
								sx={{
									position: 'absolute',
									top: '50%',
									left: '50%',
									transform: 'translate(-50%, -50%)',
								}}
								aria-hidden="true"
							>
								<IoTrophy size="32px" color="#0075FF" />
								<VuiTypography color={darkMode ? 'white' : 'dark'} variant='h2' mt='6px' fontWeight='bold' mb='4px'>
									{successRate}%
								</VuiTypography>
								<VuiTypography color='text' variant='caption'>
									Success Rate
								</VuiTypography>
							</VuiBox>
						</VuiBox>
						<VuiBox
							display='flex'
							justifyContent='center'
							flexDirection='column'
							sx={{ textAlign: 'center' }}>
							<VuiTypography color={darkMode ? 'white' : 'dark'} variant='lg' fontWeight='bold' mb='2px' mt='18px'>
								Level {level}
							</VuiTypography>
							<VuiTypography color='text' variant='button' fontWeight='regular'>
								{xp} XP earned
							</VuiTypography>
						</VuiBox>
					</VuiBox>
					<Grid
						container
						sx={({ breakpoints }) => ({
							spacing: '24px',
							[breakpoints.only('sm')]: {
								columnGap: '0px',
								rowGap: '24px'
							},
							[breakpoints.up('md')]: {
								gap: '24px',
								ml: '50px !important'
							},
							[breakpoints.only('xl')]: {
								gap: '12px',
								mx: 'auto !important'
							}
						})}>
						<Grid item xs={12} md={5.5} xl={5.8} xxl={5.5}>
							<VuiBox
								display='flex'
								p='18px'
								alignItems='center'
									sx={{
										background: innerBoxBg,
									minHeight: '110px',
									borderRadius: '20px'
								}}>
								<VuiBox display='flex' flexDirection='column' mr='auto'>
									<VuiTypography color='text' variant='caption' fontWeight='medium' mb='2px'>
										Total Points
									</VuiTypography>
									<VuiTypography
										color={darkMode ? 'white' : 'dark'}
										component='h3'
										variant='h4'
										fontWeight='bold'
										sx={({ breakpoints }) => ({
											[breakpoints.only('xl')]: {
												fontSize: '20px'
											}
										})}>
										{totalPoints}
									</VuiTypography>
								</VuiBox>
								<VuiBox
									display='flex'
									justifyContent='center'
									alignItems='center'
									sx={{
										background: info.main,
										borderRadius: '12px',
										width: '56px',
										height: '56px'
									}}>
									<IoTrophy size="24px" color="white" />
								</VuiBox>
							</VuiBox>
						</Grid>
						<Grid item xs={12} md={5.5} xl={5.8} xxl={5.5}>
							<VuiBox
								display='flex'
								p='18px'
								alignItems='center'
									sx={{
									background: innerBoxBg,
									borderRadius: '20px'
								}}>
								<VuiBox display='flex' flexDirection='column' mr='auto'>
									<VuiTypography color='text' variant='caption' fontWeight='medium' mb='2px'>
										Current Streak
									</VuiTypography>
									<VuiTypography
										color={darkMode ? 'white' : 'dark'}
										component='h3'
										variant='h4'
										fontWeight='bold'
										sx={({ breakpoints }) => ({
											[breakpoints.only('xl')]: {
												fontSize: '20px'
											}
										})}>
										{currentStreak} days
									</VuiTypography>
								</VuiBox>
								<VuiBox sx={{ maxHeight: '75px' }}>
									<LineChart
										lineChartData={lineChartDataProfile1}
										lineChartOptions={lineChartOptionsProfile1}
									/>
								</VuiBox>
							</VuiBox>
						</Grid>
						<Grid item xs={12} md={5.5} xl={5.8} xxl={5.5}>
							<VuiBox
								display='flex'
								p='18px'
								alignItems='center'
									sx={{
									background: innerBoxBg,
									borderRadius: '20px',
									minHeight: '110px'
								}}>
								<VuiBox display='flex' flexDirection='column' mr='auto'>
									<VuiTypography color='text' variant='caption' fontWeight='medium' mb='2px'>
										Challenges Completed
									</VuiTypography>
									<VuiTypography
										color={darkMode ? 'white' : 'dark'}
										component='h3'
										variant='h4'
										fontWeight='bold'
										sx={({ breakpoints }) => ({
											[breakpoints.only('xl')]: {
												fontSize: '20px'
											}
										})}>
										{challengesCompleted}
									</VuiTypography>
								</VuiBox>
								<VuiBox
									display='flex'
									justifyContent='center'
									alignItems='center'
									sx={{
										background: info.main,
										borderRadius: '12px',
										width: '56px',
										height: '56px'
									}}>
									<IoCodeSlash size="24px" color="white" />
								</VuiBox>
							</VuiBox>
						</Grid>
						<Grid item xs={12} md={5.5} xl={5.8} xxl={5.5}>
							<VuiBox
								display='flex'
								p='18px'
								alignItems='center'
									sx={{
									background: innerBoxBg,
									borderRadius: '20px'
								}}>
								<VuiBox display='flex' flexDirection='column' mr='auto'>
									<VuiTypography color='text' variant='caption' fontWeight='medium' mb='2px'>
										Time Coding
									</VuiTypography>
									<VuiTypography
										color={darkMode ? 'white' : 'dark'}
										component='h3'
										variant='h4'
										fontWeight='bold'
										sx={({ breakpoints }) => ({
											[breakpoints.only('xl')]: {
												fontSize: '20px'
											}
										})}>
										{hoursSpent}h {minutesSpent}m
									</VuiTypography>
								</VuiBox>
								<VuiBox sx={{ maxHeight: '75px' }}>
									<LineChart
										lineChartData={lineChartDataProfile2}
										lineChartOptions={lineChartOptionsProfile2}
									/>
								</VuiBox>
							</VuiBox>
						</Grid>
					</Grid>
				</Stack>
			</VuiBox>
		</Card>
	);
};

export default CarInformations;
