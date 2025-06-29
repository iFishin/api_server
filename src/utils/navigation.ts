// 导航工具函数
export interface NavigationItem {
  id: string;
  name: string;
  icon: string;
  badge?: string;
  children?: NavigationItem[];
}

export class NavigationHelper {
  // 滚动到指定区域
  static scrollToSection(sectionId: string, offset: number = 80) {
    const element = document.getElementById(sectionId) || 
                   document.querySelector(`[data-section="${sectionId}"]`);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetTop = rect.top + scrollTop - offset;
      
      window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });
    }
  }

  // 获取当前可见的区域
  static getCurrentVisibleSection(sections: string[], threshold: number = 100): string {
    for (const sectionId of sections) {
      const element = document.getElementById(sectionId) || 
                     document.querySelector(`[data-section="${sectionId}"]`);
      
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= threshold && rect.bottom >= threshold) {
          return sectionId;
        }
      }
    }
    return '';
  }

  // 监听滚动事件
  static createScrollListener(
    sections: string[], 
    onSectionChange: (sectionId: string) => void,
    threshold: number = 100
  ) {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentSection = this.getCurrentVisibleSection(sections, threshold);
          if (currentSection) {
            onSectionChange(currentSection);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    return handleScroll;
  }
}