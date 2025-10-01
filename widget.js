/*!
 * Character Stat Widget v1.0
 * Copyright (c) 2025 Device. All rights reserved.
 * https://twilight-light.tistory.com/
 */

(function() {
    // 우클릭 방지
    document.addEventListener('contextmenu', function(e) {
        if (e.target.closest('.char-stat-widget')) {
            e.preventDefault();
            return false;
        }
    });

    const CharStatWidget = {
        animationTimeouts: [],
        showingPositions: false,
        
        // 스탯별 설명 데이터
        statDescriptions: {
            purity: {
                7: "You're angelic.",
                6: "You don't feel entirely pure.",
                5: "You feel slightly soiled.",
                4: "You feel soiled.",
                3: "You feel somewhat defiled.",
                2: "You feel defiled.",
                1: "You feel utterly defiled.",
                0: "You are beyond defiled."
            },
            physique: {
                0: "You are emaciated.",
                1: "You are skinny.",
                2: "Your body is lithe and slender.",
                3: "Your body is slim.",
                4: "Your body is slim and athletic.",
                5: "Your body is toned and firm.",
                6: "Your body is toned and powerful."
            },
            willpower: {
                0: "You are timid.",
                1: "You are fainthearted.",
                2: "You are mindful.",
                3: "You are resolved.",
                4: "You are determined.",
                5: "You are tenacious.",
                6: "Your will is iron."
            },
            beauty: {
                0: "You are plain.",
                1: "You are cute.",
                2: "You are pretty.",
                3: "You are charming.",
                4: "You are beautiful.",
                5: "You are ravishing.",
                6: "Your beauty is divine."
            },
            promiscuity: {
                0: "You are chaste and pure.",
                1: "You are prudish.",
                2: "You are sexually curious.",
                3: "The thought of sexual contact excites you.",
                4: "You crave sexual contact.",
                5: "You are a slut.",
                6: "Your sexual appetite is insatiable."
            },
            exhibitionism: {
                0: "You are coy.",
                1: "You are shy.",
                2: "You like being sexualized.",
                3: "You enjoy lewd attention.",
                4: "Feeling exposed excites you.",
                5: "You are shameless.",
                6: "The thought of exposure fills you with wild abandon."
            },
            deviancy: {
                0: "You are squeamish.",
                1: "You are conventional.",
                2: "Your tastes are strange.",
                3: "Your tastes are shocking.",
                4: "Your desires are scandalous.",
                5: "You crave acts others wouldn't even conceive of.",
                6: "You lust for the unspeakable."
            },
            awareness: {
                0: "You are innocent.",
                1: "You are almost entirely innocent.",
                2: "You have a limited understanding of sexuality.",
                3: "You have a normal understanding of sexuality.",
                4: "Your knowledge of sexual depravity extends beyond that of most people.",
                5: "You have seen things that few are privy to.",
                6: "You have peered into the depths of depravity.",
                7: "Your understanding is transcendental."
            }
        },
        
        init: function() {
            this.markers = document.querySelectorAll('.char-stat-widget .body-part');
            this.statContainers = document.querySelectorAll('.char-stat-widget .stat-text-container');
            this.lines = document.querySelectorAll('.char-stat-widget .connection-line');
            this.characterImage = document.querySelector('.char-stat-widget .character');
            this.silhouetteImage = document.querySelector('.char-stat-widget .character-silhouette');
            this.iconItems = document.querySelectorAll('.char-stat-widget .icon-item');
            
            this.bindEvents();
            this.handleResize();
            this.updateStatDescriptions();
            this.initSubStats();
            this.initStandPanel();
            this.initScrollAnimation();
        },

        // 스크롤 애니메이션 초기화
        initScrollAnimation: function() {
            let animationTriggered = false;
            
            const triggerAnimation = () => {
                if (animationTriggered) return;
                
                const widget = document.querySelector('.char-stat-widget');
                if (!widget) {
                    console.log('Widget not found');
                    return;
                }
                
                const rect = widget.getBoundingClientRect();
                const windowHeight = window.innerHeight || document.documentElement.clientHeight;
                const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
                const visibleRatio = visibleHeight / rect.height;
                
                if (rect.top < windowHeight && rect.bottom > 0 && visibleRatio > 0.3) {
                    console.log('Triggering animations');
                    animationTriggered = true;
                    
                    const firstLetter = document.querySelector('.char-stat-widget .name-first-letter');
                    const nameRest = document.querySelector('.char-stat-widget .name-rest');
                    const title = document.querySelector('.char-stat-widget .character-title');
                    const descriptionLines = document.querySelectorAll('.char-stat-widget .description-line');
                    
                    if (firstLetter) {
                        firstLetter.classList.add('animate');
                    }
                    if (nameRest) {
                        nameRest.classList.add('animate');
                    }
                    if (title) {
                        title.classList.add('animate');
                    }
                    
                    descriptionLines.forEach((line) => {
                        line.classList.add('animate');
                    });
                    
                    window.removeEventListener('scroll', triggerAnimation);
                    window.removeEventListener('resize', triggerAnimation);
                }
            };
            
            setTimeout(triggerAnimation, 100);
            
            window.addEventListener('scroll', triggerAnimation);
            window.addEventListener('resize', triggerAnimation);
        },

        // 부가 스탯 패널 초기화
        initSubStats: function() {
            const subStatsTabs = document.querySelectorAll('.char-stat-widget .sub-stats-toggle');
            const subStatsPanel = document.querySelector('.char-stat-widget .sub-stats-panel');
            
            // 게이지 애니메이션 통합 함수
            const animateSubStatGauges = (container, delay = 100, source = 'unknown') => {
                const fills = container.querySelectorAll('.sub-stat-fill');
                fills.forEach((fill, index) => {
                    const targetWidth = fill.dataset.target || fill.style.width;
                    
                    // 애니메이션 클래스 추가
                    fill.classList.add('animating');
                    
                    setTimeout(() => {
                        fill.style.width = targetWidth;
                        
                        // 애니메이션 완료 후 클래스 제거
                        setTimeout(() => {
                            fill.classList.remove('animating');
                        }, 600);
                    }, delay);
                });
            };
            
            // 탭 토글
            if (subStatsTabs.length > 0 && subStatsPanel) {
                let isPanelOpen = false;
                let currentActiveTab = null;
                
                // 네비게이션 요소들
                const page1 = document.getElementById('page-1');
                const page2 = document.getElementById('page-2');
                const pageLI = document.getElementById('page-li');
                const pageNavigation = document.getElementById('page-navigation');
                const totalPagesSpan = document.getElementById('total-pages');
                const prevBtn = document.getElementById('prev-btn');
                const nextBtn = document.getElementById('next-btn');
                const currentPageSpan = document.getElementById('current-page');
                
                // 각 탭별 페이지 상태 관리
                let statsCurrentPage = 1;
                let statsMaxPages = 2;
                let liCurrentPage = 1;
                let liMaxPages = 1;
                
                // 네비게이션 업데이트 함수
                const updateNavigation = (tabType) => {
                    if (tabType === 'li') {
                        if (liMaxPages > 1) {
                            if (pageNavigation) pageNavigation.style.setProperty('display', 'flex', 'important');
                            if (currentPageSpan) currentPageSpan.textContent = liCurrentPage.toString();
                            if (totalPagesSpan) totalPagesSpan.textContent = liMaxPages.toString();
                            if (prevBtn) prevBtn.disabled = liCurrentPage === 1;
                            if (nextBtn) nextBtn.disabled = liCurrentPage === liMaxPages;
                        } else {
                            if (pageNavigation) {
                                pageNavigation.style.setProperty('display', 'none', 'important');
                            }
                        }
                    } else {
                        if (pageNavigation) pageNavigation.style.setProperty('display', 'flex', 'important');
                        if (currentPageSpan) currentPageSpan.textContent = statsCurrentPage.toString();
                        if (totalPagesSpan) totalPagesSpan.textContent = statsMaxPages.toString();
                        if (prevBtn) prevBtn.disabled = statsCurrentPage === 1;
                        if (nextBtn) nextBtn.disabled = statsCurrentPage === statsMaxPages;
                    }
                };

                subStatsTabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        const tabType = tab.dataset.tab;
                        
                        // 패널이 닫혀있으면 열기
                        if (!isPanelOpen) {
                            subStatsPanel.classList.add('show');
                            isPanelOpen = true;
                            
                            // 클릭한 탭 활성화
                            subStatsTabs.forEach(t => t.classList.remove('active'));
                            tab.classList.add('active');
                            currentActiveTab = tabType;
                            
                            // 페이지 및 네비게이션 전환
                            if (tabType === 'li') {
                                if (page1) page1.classList.remove('active');
                                if (page2) page2.classList.remove('active');
                                if (pageLI) {
                                    pageLI.classList.add('show-li');
                                    pageLI.style.display = 'block';
                                }
                                updateNavigation('li');
                            } else {
                                if (pageLI) {
                                    pageLI.classList.remove('show-li');
                                    pageLI.style.display = 'none';
                                }
                                if (page1) page1.classList.add('active');
                                if (page2) page2.classList.remove('active');
                                statsCurrentPage = 1;
                                updateNavigation('page1');
                            }
                            
                            // Stats 패널 애니메이션
                            if (tabType !== 'li') {
                                setTimeout(() => {
                                    const activePages = subStatsPanel.querySelector('.sub-stats-pages.active');
                                    if (activePages) {
                                        animateSubStatGauges(activePages, 100, 'panel-open');
                                    }
                                }, 400);
                            }
                        } else {
                            // 같은 탭을 클릭하면 패널 닫기
                            if (tab.classList.contains('active')) {
                                subStatsPanel.classList.remove('show');
                                tab.classList.remove('active');
                                isPanelOpen = false;
                                currentActiveTab = null;
                            } else {
                                // 다른 탭으로 전환
                                subStatsTabs.forEach(t => t.classList.remove('active'));
                                tab.classList.add('active');
                                currentActiveTab = tabType;
                                
                                // 페이지 및 네비게이션 전환
                                if (tabType === 'li') {
                                    if (page1) page1.classList.remove('active');
                                    if (page2) page2.classList.remove('active');
                                    if (pageLI) {
                                        pageLI.classList.add('show-li');
                                        pageLI.style.display = 'block';
                                    }
                                    updateNavigation('li');
                                } else {
                                    if (pageLI) {
                                        pageLI.classList.remove('show-li');
                                        pageLI.style.display = 'none';
                                    }
                                    if (page1) page1.classList.add('active');
                                    if (page2) page2.classList.remove('active');
                                    statsCurrentPage = 1;
                                    updateNavigation('page1');
                                    
                                    // Stats 탭 전환 시 애니메이션
                                    setTimeout(() => {
                                        const activePages = subStatsPanel.querySelector('.sub-stats-pages.active');
                                        if (activePages) {
                                            animateSubStatGauges(activePages, 100, 'tab-switch');
                                        }
                                    }, 100);
                                }
                            }
                        }
                    });
                });
                
                function updatePage(source = 'unknown') {
                    const activeTab = document.querySelector('.sub-stats-toggle.active');
                    if (!activeTab) return;
                    
                    const isLITab = activeTab.dataset.tab === 'li';
                    
                    if (isLITab) {
                        return;
                    }
                    
                    const page1 = document.getElementById('page-1');
                    const page2 = document.getElementById('page-2');
                    
                    if (statsCurrentPage === 1) {
                        page1.classList.add('active');
                        page2.classList.remove('active');
                    } else {
                        page1.classList.remove('active');
                        page2.classList.add('active');
                    }
                    
                    if (source !== 'initial') {
                        const activePage = statsCurrentPage === 1 ? page1 : page2;
                        const fills = activePage.querySelectorAll('.sub-stat-fill');
                        fills.forEach((fill, index) => {
                            const targetWidth = fill.dataset.target || fill.style.width;
                            fill.style.width = '0';
                            fill.classList.add('animating');
                            setTimeout(() => {
                                fill.style.width = targetWidth;
                                setTimeout(() => {
                                    fill.classList.remove('animating');
                                }, 600);
                            }, 100);
                        });
                    }
                    
                    currentPageSpan.textContent = statsCurrentPage;
                    prevBtn.disabled = statsCurrentPage === 1;
                    nextBtn.disabled = statsCurrentPage === 2;
                }

                if (prevBtn && nextBtn) {
                    prevBtn.addEventListener('click', () => {
                        const activeTab = document.querySelector('.sub-stats-toggle.active');
                        if (activeTab && activeTab.dataset.tab === 'li') return;
                        
                        if (statsCurrentPage > 1) {
                            statsCurrentPage--;
                            updatePage('prev-btn');
                        }
                    });

                    nextBtn.addEventListener('click', () => {
                        const activeTab = document.querySelector('.sub-stats-toggle.active');
                        if (activeTab && activeTab.dataset.tab === 'li') return;
                        
                        if (statsCurrentPage < 2) {
                            statsCurrentPage++;
                            updatePage('next-btn');
                        }
                    });

                    updatePage('initial');
                }
            }
        },

        // 스탠드 패널 초기화
        initStandPanel: function() {
            const standToggle = document.querySelector('.char-stat-widget .stand-toggle');
            const standPanel = document.querySelector('.char-stat-widget .stand-panel');
            const prevBtn = standPanel?.querySelector('.nav-btn.prev');
            const nextBtn = standPanel?.querySelector('.nav-btn.next');
            const nameDisplay = document.getElementById('stand-current-name');
            
            // 캐릭터 데이터
            const characterImages = [
                'https://raw.githubusercontent.com/Devi-ce/tistory/main/default.gif',
                'https://raw.githubusercontent.com/Devi-ce/tistory/main/smile.gif',
                'https://raw.githubusercontent.com/Devi-ce/tistory/main/sad.gif',
                'https://raw.githubusercontent.com/Devi-ce/tistory/main/oops1.gif',
                'https://raw.githubusercontent.com/Devi-ce/tistory/main/oops2.gif',
                'https://raw.githubusercontent.com/Devi-ce/tistory/main/oops3.gif',
                'https://raw.githubusercontent.com/Devi-ce/tistory/main/oops4.gif',
                'https://raw.githubusercontent.com/Devi-ce/tistory/main/shy.gif'
            ];
                
            const characterNames = ['기본', '기쁨', '슬픔', '당황1', '당황2', '당황3', '당황4', '부끄러움'];
            let currentIndex = 0;
            
            // 캐릭터 변경 함수
            const changeCharacter = (direction) => {
                if (direction === 'prev') {
                    currentIndex = currentIndex === 0 ? characterImages.length - 1 : currentIndex - 1;
                } else if (direction === 'next') {
                    currentIndex = currentIndex === characterImages.length - 1 ? 0 : currentIndex + 1;
                }
                
                const characterLayer = document.getElementById('character-layer');
                if (characterLayer) {
                    characterLayer.src = characterImages[currentIndex];
                }
                
                if (nameDisplay) {
                    nameDisplay.textContent = characterNames[currentIndex];
                }
            };
            
            // 패널 토글
            if (standToggle && standPanel) {
                standToggle.addEventListener('click', () => {
                    const isOpen = standPanel.classList.contains('show');
                    
                    if (isOpen) {
                        standPanel.classList.remove('show');
                        standToggle.classList.remove('active');
                    } else {
                        standPanel.classList.add('show');
                        standToggle.classList.add('active');
                    }
                });
            }
            
            // 네비게이션 버튼
            if (prevBtn) {
                prevBtn.addEventListener('click', () => changeCharacter('prev'));
            }
            
            if (nextBtn) {
                nextBtn.addEventListener('click', () => changeCharacter('next'));
            }
        },

        updateStatDescriptions: function() {
            this.iconItems.forEach(icon => {
                const statType = icon.dataset.icon;
                const currentValue = parseInt(icon.querySelector('.stat-current').textContent);
                const gaugeTextBase = icon.querySelector('.gauge-text-base');
                const gaugeTextClipped = icon.querySelector('.gauge-fill .gauge-text-clipped');
                
                if (this.statDescriptions[statType] && this.statDescriptions[statType][currentValue]) {
                    const description = this.statDescriptions[statType][currentValue];
                    if (gaugeTextBase) gaugeTextBase.textContent = description;
                    if (gaugeTextClipped) gaugeTextClipped.textContent = description;
                }
            });
        },

        updateSingleStatDescription: function(iconElement) {
            const statType = iconElement.dataset.icon;
            const currentValue = parseInt(iconElement.querySelector('.stat-current').textContent);
            const gaugeTextBase = iconElement.querySelector('.gauge-text-base');
            const gaugeTextClipped = iconElement.querySelector('.gauge-fill .gauge-text-clipped');
            
            if (this.statDescriptions[statType] && this.statDescriptions[statType][currentValue]) {
                const description = this.statDescriptions[statType][currentValue];
                if (gaugeTextBase) gaugeTextBase.textContent = description;
                if (gaugeTextClipped) gaugeTextClipped.textContent = description;
            }
        },

        handleResize: function() {
            window.addEventListener('resize', () => {
                this.resetAllStates();
            });
        },

        clearTimeouts: function() {
            this.animationTimeouts.forEach(id => clearTimeout(id));
            this.animationTimeouts = [];
        },

        toggleMarkerPositions: function() {
            this.showingPositions = !this.showingPositions;
            
            if (this.showingPositions) {
                this.silhouetteImage.classList.add('show');
                this.markers.forEach(marker => {
                    marker.classList.add('show-position');
                });
            } else {
                this.silhouetteImage.classList.remove('show');
                this.markers.forEach(marker => {
                    marker.classList.remove('show-position');
                });
            }
        },

        hideMarkerPositions: function() {
            if (this.showingPositions) {
                this.showingPositions = false;
                this.silhouetteImage.classList.remove('show');
                this.markers.forEach(marker => {
                    marker.classList.remove('show-position');
                });
            }
        },

        toggleIconActive: function(iconElement) {
            if (iconElement.classList.contains('active')) {
                iconElement.classList.remove('active');
                this.resetGauge(iconElement, false);
            } else {
                iconElement.classList.add('active');
                this.updateSingleStatDescription(iconElement);
                this.animateGauge(iconElement);
            }
        },

        getStatColor: function(statType, currentValue) {
            const colorMaps = {
                'promiscuity': {
                    0: '#3EB216', 1: '#21c1c0', 2: '#5a9bbf', 3: '#4c71fd',
                    4: '#a94ac7', 5: '#e10583', 6: '#e8373d'
                },
                'exhibitionism': {
                    0: '#3EB216', 1: '#21c1c0', 2: '#5a9bbf', 3: '#4c71fd',
                    4: '#a94ac7', 5: '#e10583', 6: '#e8373d'
                },
                'deviancy': {
                    0: '#3EB216', 1: '#21c1c0', 2: '#5a9bbf', 3: '#4c71fd',
                    4: '#a94ac7', 5: '#e10583', 6: '#e8373d'
                },
                'purity': {
                    0: '#e8373d', 1: '#da373d', 2: '#e10583', 3: '#a94ac7',
                    4: '#4c71fd', 5: '#5a9bbf', 6: '#21c1c0', 7: '#3EB216'
                },
                'physique': {
                    0: '#e8373d', 1: '#e10583', 2: '#a94ac7', 3: '#4c71fd',
                    4: '#5a9bbf', 5: '#21c1c0', 6: '#3EB216'
                },
                'willpower': {
                    0: '#e8373d', 1: '#e10583', 2: '#a94ac7', 3: '#4c71fd',
                    4: '#5a9bbf', 5: '#21c1c0', 6: '#3EB216'
                },
                'beauty': {
                    0: '#e8373d', 1: '#e10583', 2: '#a94ac7', 3: '#4c71fd',
                    4: '#5a9bbf', 5: '#21c1c0', 6: '#3EB216'
                },
                'awareness': {
                    0: '#3eb216', 1: '#29c1c0', 2: '#5a9bbf', 3: '#4c71fd',
                    4: '#a94ac7', 5: '#e10583', 6: '#e83734', 7: '#e8373d'
                }
            };

            return colorMaps[statType] && colorMaps[statType][currentValue] ? 
                   colorMaps[statType][currentValue] : '#ea76cb';
        },

        animateGauge: function(iconElement) {
            const gaugeContainer = iconElement.querySelector('.segment-gauge-container');
            const gaugeFill = iconElement.querySelector('.gauge-fill');
            const gaugeTextBase = iconElement.querySelector('.gauge-text-base');
            const statCurrent = iconElement.querySelector('.stat-current');
            const statTitle = iconElement.querySelector('.icon-stat-title');
            
            if (gaugeContainer && gaugeFill) {
                const currentValue = parseInt(statCurrent.textContent);
                const maxValue = parseInt(iconElement.querySelector('.stat-max').textContent);
                const percentage = (currentValue / maxValue) * 100;
                const iconType = iconElement.dataset.icon;
                
                const statColor = this.getStatColor(iconType, currentValue);
                
                const containerRect = gaugeContainer.getBoundingClientRect();
                const containerWidth = containerRect.width;
                const targetPixels = containerWidth * percentage / 100;
                
                gaugeFill.style.setProperty('width', '0px', 'important');
                gaugeFill.style.setProperty('background', statColor, 'important');
                gaugeFill.style.setProperty('--container-width', containerWidth + 'px');
                
                if (gaugeTextBase) {
                    gaugeTextBase.style.setProperty('color', statColor, 'important');
                }
                if (statCurrent) {
                    statCurrent.style.setProperty('color', statColor, 'important');
                }
                if (statTitle) {
                    statTitle.style.setProperty('color', statColor, 'important');
                }
                
                gaugeFill.offsetWidth;
                
                setTimeout(() => {
                    gaugeFill.style.setProperty('width', targetPixels + 'px', 'important');
                }, 100);
            }
        },

        resetGauge: function(iconElement, resetColor = false) {
            const gaugeFill = iconElement.querySelector('.gauge-fill');
            const gaugeTextBase = iconElement.querySelector('.gauge-text-base');
            const statCurrent = iconElement.querySelector('.stat-current');
            const statTitle = iconElement.querySelector('.icon-stat-title');
            
            if (gaugeFill) {
                gaugeFill.style.setProperty('width', '0px', 'important');
                if (resetColor) {
                    gaugeFill.style.setProperty('background', '#ea76cb', 'important');
                }
            }
            
            if (resetColor) {
                if (gaugeTextBase) {
                    gaugeTextBase.style.setProperty('color', '#ea76cb', 'important');
                }
                if (statCurrent) {
                    statCurrent.style.setProperty('color', '#ea76cb', 'important');
                }
                if (statTitle) {
                    statTitle.style.setProperty('color', '#ea76cb', 'important');
                }
            }
        },

        resetAllStates: function() {
            this.clearTimeouts();
            
            this.markers.forEach(marker => {
                marker.classList.remove('active');
            });
            
            this.statContainers.forEach(container => {
                container.classList.remove('show');
                container.style.transition = 'none';
                const statTexts = container.querySelectorAll('.stat-text');
                statTexts.forEach(text => {
                    text.classList.remove('show');
                    text.style.transition = 'none';
                });
                container.offsetHeight;
                setTimeout(() => {
                    container.style.transition = '';
                    statTexts.forEach(text => {
                        text.style.transition = '';
                    });
                }, 10);
            });
            
            this.lines.forEach(line => {
                line.classList.remove('show');
                const path = line.querySelector('.connection-path');
                const endPoint = line.querySelector('.end-point');
                
                path.style.transition = 'none';
                path.style.strokeDashoffset = '';
                path.style.strokeDasharray = '';
                endPoint.classList.remove('show');
                endPoint.style.transition = 'none';
                
                path.offsetHeight;
                setTimeout(() => {
                    path.style.transition = '';
                    endPoint.style.transition = '';
                }, 10);
            });
            
            this.activeMarker = null;
            this.activeStatContainer = null;
            this.activeLine = null;
        },

        drawLine: function(marker, statContainer, line) {
            const path = line.querySelector('.connection-path');
            const endPoint = line.querySelector('.end-point');
            
            path.style.transition = 'none';
            path.style.strokeDashoffset = '';
            path.style.strokeDasharray = '';
            path.offsetHeight;
            
            const markerRect = marker.getBoundingClientRect();
            const containerRect = document.querySelector('.char-stat-widget .character-container').getBoundingClientRect();

            const markerCenterX = markerRect.left + markerRect.width / 2 - containerRect.left;
            const markerCenterY = markerRect.top + markerRect.height / 2 - containerRect.top;
            
            const statType = marker.dataset.stat;
            const statData = this.getStatData(statType, marker);  // marker를 매개변수로 전달
            
            const isLeftSide = ['anal', 'thighs', 'hands'].includes(statType);
            const direction = isLeftSide ? -1 : 1;
            
            const containerWidth = containerRect.width;
            const firstHorizontal = Math.max(30, containerWidth * 0.1);
            const diagonalDistance = Math.max(8, containerWidth * 0.02);
            const finalHorizontalLength = Math.max(80, containerWidth * 0.25);
            
            const startX = markerCenterX;
            const startY = markerCenterY;
            const point1X = startX + (firstHorizontal * direction);
            const point1Y = startY;
            const point2X = point1X + (diagonalDistance * direction);
            const point2Y = point1Y + (diagonalDistance * (isLeftSide ? -1 : 1));
            const endX = point2X + (finalHorizontalLength * direction);
            const endY = point2Y;
            
            const pathData = `M ${startX} ${startY} L ${point1X} ${point1Y} L ${point2X} ${point2Y} L ${endX} ${endY}`;
            
            path.setAttribute('d', pathData);
            
            const totalLength = path.getTotalLength();
            path.style.strokeDasharray = totalLength;
            path.style.strokeDashoffset = totalLength;
            
            endPoint.setAttribute('cx', endX);
            endPoint.setAttribute('cy', endY);
            
            statContainer.style.top = (endY - 25) + 'px';
            
            if (isLeftSide) {
                statContainer.style.left = endX + 'px';
                statContainer.style.textAlign = 'left';
            } else {
                statContainer.style.right = (document.querySelector('.char-stat-widget .character-container').offsetWidth - endX) + 'px';
                statContainer.style.left = 'auto';
                statContainer.style.textAlign = 'right';
            }
            
            statContainer.innerHTML = '';
            
            statData.forEach((stat, index) => {
                const statElement = document.createElement('div');
                statElement.className = 'stat-text';
                
                const percentageText = stat.percentage !== '' ? ` <span class="stat-percentage">${stat.percentage}%</span>` : '';
                const gradeClass = stat.grade.toLowerCase() === 'none' ? 'stat-grade none' : 'stat-grade';
                
                statElement.innerHTML = `${stat.name} <span class="${gradeClass}">${stat.grade}</span>${percentageText}`;
                statContainer.appendChild(statElement);
            });
            
            requestAnimationFrame(() => {
                path.style.transition = `stroke-dashoffset 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
                path.style.strokeDashoffset = '0';
                
                const timeout = setTimeout(() => {
                    if (line.classList.contains('show')) {
                        endPoint.classList.add('show');
                        statContainer.classList.add('show');
                        
                        const statTexts = statContainer.querySelectorAll('.stat-text');
                        statTexts.forEach((text, index) => {
                            const textTimeout = setTimeout(() => {
                                if (statContainer.classList.contains('show')) {
                                    text.classList.add('show');
                                }
                            }, index * 80);
                            this.animationTimeouts.push(textTimeout);
                        });
                    }
                }, 400);
                this.animationTimeouts.push(timeout);
            });
        },

        // HTML의 data-stat-info 속성에서 스탯 데이터를 읽어오는 함수
        getStatData: function(statType, marker) {
            // 마커 엘리먼트가 없으면 statType으로 찾기
            if (!marker) {
                marker = document.querySelector(`.char-stat-widget .body-part[data-stat="${statType}"]`);
            }
            
            // HTML의 data-stat-info 속성에서 JSON 데이터 읽기
            if (marker && marker.dataset.statInfo) {
                try {
                    return JSON.parse(marker.dataset.statInfo);
                } catch (e) {
                    console.error('Failed to parse stat data for', statType, e);
                }
            }
            
            // 기본값 반환 (데이터가 없는 경우)
            return [];
        },

        bindEvents: function() {
            let hoverDebounceTimer = null;
            let isAnimating = false;
            let pendingMarker = null;

            this.characterImage.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMarkerPositions();
            });

            this.iconItems.forEach(icon => {
                icon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleIconActive(icon);
                });
            });

            this.markers.forEach(marker => {
                marker.addEventListener('mouseenter', () => {
                    const statType = marker.dataset.stat;
                    const statContainer = document.getElementById(`stat-${statType}`);
                    const line = document.getElementById(`line-${statType}`);

                    if (this.activeMarker === marker) return;

                    if (hoverDebounceTimer) {
                        clearTimeout(hoverDebounceTimer);
                        hoverDebounceTimer = null;
                    }

                    if (isAnimating) {
                        pendingMarker = marker;
                        return;
                    }

                    hoverDebounceTimer = setTimeout(() => {
                        isAnimating = true;
                        
                        this.hideMarkerPositions();
                        this.resetAllStates();

                        this.activeMarker = marker;
                        this.activeStatContainer = statContainer;
                        this.activeLine = line;

                        line.classList.add('show');
                        this.drawLine(marker, statContainer, line);

                        setTimeout(() => {
                            isAnimating = false;
                            
                            if (pendingMarker && pendingMarker !== marker) {
                                const nextMarker = pendingMarker;
                                pendingMarker = null;
                                nextMarker.dispatchEvent(new MouseEvent('mouseenter'));
                            }
                        }, 300);
                    }, 80);
                });

                marker.addEventListener('mouseleave', () => {
                    if (hoverDebounceTimer) {
                        clearTimeout(hoverDebounceTimer);
                        hoverDebounceTimer = null;
                    }

                    if (pendingMarker === marker) {
                        pendingMarker = null;
                    }

                    const timeout = setTimeout(() => {
                        if (!marker.matches(':hover') && 
                            !(this.activeStatContainer && this.activeStatContainer.matches(':hover'))) {
                            this.resetAllStates();
                            isAnimating = false;
                        }
                    }, 100);
                    this.animationTimeouts.push(timeout);
                });
            });

            this.statContainers.forEach(container => {
                container.addEventListener('mouseleave', () => {
                    const correspondingMarker = document.querySelector(`.char-stat-widget [data-stat="${container.id.replace('stat-', '')}"]`);
                    
                    const timeout = setTimeout(() => {
                        if (!correspondingMarker?.matches(':hover') && !container.matches(':hover')) {
                            this.resetAllStates();
                            isAnimating = false;
                        }
                    }, 100);
                    this.animationTimeouts.push(timeout);
                });
            });
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => CharStatWidget.init());
    } else {
        CharStatWidget.init();
    }
})();
