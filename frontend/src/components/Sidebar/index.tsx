import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import SearchBar from './SearchBar';
import DistrictMap from './DistrictMap';
// import SidebarTabs from './SidebarTabs';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import PieChart from './Piechartshow';
import BarChart from './BarChart';
import BarchartStacked from './BarChartStack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
// import Select, { SelectChangeEvent } from '@mui/material/Select';
import Carousel from 'react-material-ui-carousel'
import SettingsIcon from '@mui/icons-material/Settings';
import DialogTitle from '@mui/material/DialogTitle';
import piechart from 'assets/logo/pie-charts.png';
import linechart from 'assets/logo/line-graph.png';
import graphchart from 'assets/logo/graphic-chart.png';
import samplechart from 'assets/logo/sample_charts.png';
// import samchart from 'assets/logo/sam.png';



export default function Sidebar(): JSX.Element {
  const { t } = useTranslation('global');
  const theme = useTheme();

  const [piechartshow, setpieShow] = React.useState(false);
  const [barchartshow, setbarshow] = React.useState(false);
  const [barchartstackshow, setbarstackshow] = React.useState(false);
  const [hide1, setHide1] = React.useState(true);
  const [hide2, setHide2] = React.useState(false);
  const [hide3, setHide3] = React.useState(false);
  const handleClose = () => setpieShow(false);
  const handleShow = () => setpieShow(true);

  const handlebarchartClose = () => setbarshow(false);
  const handlebarchartShow = () => setbarshow(true);

  const handlebarchartstackClose = () => setbarstackshow(false);
  const handlebarchartstackShow = () => setbarstackshow(true);



  // const onSelect = () => setonslecectopen(false)
  const toggleHide = () => {
    setHide1(true);
    setHide2(false);
    setHide3(false);
  };
  const toggleHide2 = () => {
    setHide1(false);
    setHide2(true);
    setHide3(false);
  };

  const toggleHide3 = () => {
    setHide1(false);
    setHide2(false);
    setHide3(true);
  };



  return (
    <Stack
      id='sidebar-root'

      sx={{
        borderRight: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.default,
        width: '300px',

      }}
    >
      <Box id='sidebar-map-search-bar-wrapper'>
        <SearchBar />
      </Box>
      <Box id='sidebar-map-wrapper'>

        <DistrictMap />

      </Box>

      <Box >

        <div style={{ height: '200px', }}>
          <div
            style={{

              transition: 'width 0.3s ease', // Add smooth transition


            }}
          >



            <div style={{ display: 'flex' }}>



              <Button variant="outlined" sx={{ width: '100px', height: '30px' }} style={{ backgroundColor: hide1 ? "#6892d5" : "white", color: hide1 ? "white" : "black" }} onClick={toggleHide}>New</Button>
              <Button variant="outlined" sx={{ width: '100px', height: '30px' }} style={{ backgroundColor: hide2 ? "#6892d5" : "white", color: hide2 ? "white" : "black" }} onClick={toggleHide2}>Load</Button>
              <Button variant="outlined" sx={{ width: '100px', height: '30px' }} style={{ backgroundColor: hide3 ? "#6892d5" : "white", color: hide3 ? "white" : "black" }} onClick={toggleHide3}>Display</Button>



            </div>
            {hide1 &&
              <div style={{ paddingTop: '10px', paddingLeft: '2px' }} >

                <Carousel autoPlay={false}>
                  {/* <Box sx={ {display:'flex', width:'500px' , flexDirection:'row',overflow:'hidden',overflowX:'scroll'}}> */}

                  <Box sx={{ display: 'flex', width: '500px' }}>
                    <div style={{ marginLeft: '15px' }} onClick={handleShow}>
                      <img src={piechart} alt={t('pie-chart')} width='80px' height='90px' />
                      <p style={{ marginLeft: '15px', fontSize: '12px' }}>Pie Chart</p>
                    </div>
                    <div style={{ marginLeft: '15px' }} onClick={handlebarchartShow}>
                      <img src={linechart} alt={t('pie-chart')} width='80px' height='90px' />
                      <p style={{ marginLeft: '15px', fontSize: '12px' }}>Bar Chart</p>
                    </div>

                    <div style={{ marginLeft: '15px' }} onClick={handlebarchartstackShow}>
                      <img src={graphchart} alt={t('pie-chart')} width='80px' height='90px' />
                      <p style={{ marginLeft: '15px', fontSize: '12px' }}>Bar Chart</p>
                    </div>
                  </Box>
                  <Box sx={{ display: 'flex', width: '500px' }}>
                    <div style={{ marginLeft: '15px' }} onClick={handlebarchartstackShow}>
                      <img src={graphchart} alt={t('pie-chart')} width='80px' height='100px' />
                      <p style={{ marginLeft: '15px', fontSize: '12px' }}>Bar Chart</p>
                    </div>

                    <div style={{ marginLeft: '15px' }} onClick={handlebarchartstackShow}>
                      <img src={graphchart} alt={t('pie-chart')} width='80px' height='100px' />
                      <p style={{ marginLeft: '15px', fontSize: '12px' }}>Bar Chart</p>
                    </div>
                    <div style={{ marginLeft: '15px' }} onClick={handlebarchartShow}>
                      <img src={linechart} alt={t('pie-chart')} width='80px' height='100px' />
                      <p style={{ marginLeft: '15px', fontSize: '12px' }}>Bar Chart</p>
                    </div>
                  </Box>
                </Carousel>
              </div>
            }
            {hide2 &&
              <div>
                <div style={{ paddingLeft: '250px', height: '30px', paddingTop: '10px' }}>
                  {/* <SettingsIcon/> */}
                </div>
                <div style={{ background: 'white' }}>
                  {/* <div style={{marginLeft:'15px'}} onClick={handleShow}>
      <img src={piechart} alt={t('pie-chart')} width='80px' height='100px'/>
      <p style={{marginLeft:'15px',fontSize:'12px'}}>Pie Chart</p>
      </div>
       */}
                  <Carousel>
                    <Box>
                      <div style={{ marginLeft: '15px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridGap: '10px' }}>
                        <div style={{ transition: 'transform 0.3s ease' }} className="zoom-image">
                          <img src={samplechart} alt={t('pie-chart')} width='120px' height='100px' />
                        </div>
                        <div>
                          <img src={samplechart} alt={t('pie-chart')} width='120px' height='100px' />
                        </div>

                        <p style={{ marginLeft: '15px', fontSize: '12px' }}>Pie Chart</p>

                      </div>

                    </Box>
                    <Box>
                      <div style={{ marginLeft: '15px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridGap: '10px' }}>
                        <div style={{ transition: 'transform 0.3s ease' }} className="zoom-image">
                          <img src={samplechart} alt={t('pie-chart')} width='120px' height='100px' />
                        </div>
                        <div>
                          <img src={samplechart} alt={t('pie-chart')} width='120px' height='100px' />
                        </div>

                        <p style={{ marginLeft: '15px', fontSize: '12px' }}>Pie Chart</p>

                      </div>

                    </Box>
                  </Carousel>
                </div>
              </div>

            }
            {hide3 &&
              <div style={{ height: '100px' }}>
                <div style={{ paddingLeft: '250px', height: '30px', color: '#6892d5', paddingTop: '10px' }}>
                  <SettingsIcon onClick={handleShow} />
                </div>
                <div style={{ marginLeft: '15px' }} onClick={handlebarchartShow}>
                  <img src={graphchart} alt={t('pie-chart')} width='250px' height='200px' />
                  <p style={{ marginLeft: '15px', fontSize: '12px' }}>Bar Chart</p>
                </div>
              </div>
            }

          </div>


          <Dialog open={piechartshow} onClose={handleClose}

            PaperProps={{
              style: {
                position: 'absolute',
                left: 280,

              }
            }}
          >
            <DialogTitle>Pie Chart</DialogTitle>

            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 3,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
            <br></br>
            <DialogContent >
              <PieChart />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={handleClose}>Save</Button>
            </DialogActions>
          </Dialog>


          <Dialog open={barchartshow} onClose={handlebarchartClose}
            PaperProps={{
              style: {
                position: 'absolute',
                left: 280,

              }
            }}>
            <DialogTitle>Bar Chart</DialogTitle>

            <IconButton
              aria-label="close"
              onClick={handlebarchartClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 3,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
            <br></br>

            <DialogContent >
              <BarChart />
            </DialogContent>
            <DialogActions>
              <Button onClick={handlebarchartClose}>Cancel</Button>
              <Button onClick={handlebarchartClose}>Save</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={barchartstackshow} onClose={handlebarchartstackClose}
            PaperProps={{
              style: {
                position: 'absolute',
                left: 280,
                width: 600
              },
            }}
          >
            <DialogTitle>Bar Line Chart</DialogTitle>

            <IconButton
              aria-label="close"
              onClick={handlebarchartstackClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
            <DialogContent>
              <BarchartStacked />
            </DialogContent>
            <DialogActions>
              <Button onClick={handlebarchartstackClose}>Cancel</Button>
              <Button onClick={handlebarchartstackClose}>Save</Button>
            </DialogActions>
          </Dialog>


          {/* 
      <Modal
        open={barchartshow}
        onClose={handlebarchartClose}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <Box sx={{ ...style,width: '50%' }}>
        <BarChart/>
        </Box>
      </Modal> */}

          {/* <Modal
        open={barchartstackshow}
        onClose={handlebarchartstackClose}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <Box sx={{ ...style,width: '50%' }}>
        <BarchartStacked/>
        </Box>
      </Modal> */}

        </div>

      </Box>

      <Container disableGutters sx={{ flexGrow: 1 }}>

      </Container>


    </Stack>
  );
}